import {DB} from "../utils/db";
import {Logger} from "../utils/logger";
import {Request, Response} from "express";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder, QueryParam, Validator} from "../types/controllers";
import {EntityController} from "./entity";
import {
    transactionsGetSchema,
    transactionsPatchSchema,
    transactionsPostSchema,
    TransactionGetSchema,
    TransactionGetServer, TransactionsGetServer, TransactionsRequestQuery, transactionsRequestQuerySchema,
    processTransactions, CustomError, GetPagResServer
} from "@app/shared";
import {isBody} from "../utils/general";

export class TransactionsController extends EntityController<TransactionGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'transaction',
            tableName: 'transactions',
            schemas: {
                get: transactionsGetSchema,
                post: transactionsPostSchema,
                patch: transactionsPatchSchema
            },
            getFields: transactionsGetSchema.omit({category: true}).keyof().options
        });

        this.router.get('/', this.getTransactions);
    }

    protected getBasicQuery = (source: string): string => {
        return `
            SELECT ${this.getQueryFields(source)},
                   CASE
                       WHEN c.id IS NOT NULL THEN json_build_object(
                               'id', c.id,
                               'name', c.name,
                               'color', c.color
                       )
                   END AS category
            FROM ${source}
                     LEFT JOIN categories c ON ${source}.category_id = c.id
        `;
    };

    private getTransactions = async (req: Request, res: Response<GetPagResServer<TransactionGetServer> | CustomError>) => {
        const uid = req.user!.uid;
        try {
            const {
                from,
                to,
                filter,
                offset,
                limit
            }: TransactionsRequestQuery = transactionsRequestQuerySchema.parse(req.query);

            this.logger.debug('Fetching transactions', {uid, offset, from, to, filter, limit});
            const params: QueryParam[] = [uid], cond: string[] = [`${this.tableName}.user_uid = $1`];

            if (from) {
                params.push(from);
                cond.push(`${this.tableName}.timestamp >= $${params.length}`);
            }
            if (to) {
                const nextDay = new Date(to);
                nextDay.setDate(nextDay.getDate() + 1);
                params.push(nextDay.toISOString());
                cond.push(`${this.tableName}.timestamp < $${params.length}`);
            }
            if (filter) {
                params.push(`%${filter}%`);
                cond.push(`LOWER(${this.tableName}.name) LIKE LOWER($${params.length})`);
            }

            const rawLimit = Number(limit ?? this.pageSize);
            let realLimit: number = 0, includeLimit = true;

            if (rawLimit > 0) realLimit = rawLimit;
            else includeLimit = false;

            if (includeLimit) params.push(realLimit + 1);
            params.push(Number(offset ?? 0));

            const limitClause = includeLimit ? `LIMIT $${params.length - 1}` : "";
            const offsetClause = `OFFSET $${params.length}`;

            const query = `
                ${this.getBasicQuery(this.tableName)}
                where ${cond.join(' AND ')}
                ORDER BY ${this.tableName}.timestamp DESC
                    ${limitClause} ${offsetClause};
            `;

            const result = await this.db.query(query, params);

            let transactions: TransactionsGetServer, isLastPage: boolean;
            if (includeLimit) {
                isLastPage = result.rows.length <= realLimit;
                transactions = processTransactions(result.rows.slice(0, realLimit));
            } else {
                isLastPage = true;
                transactions = processTransactions(result.rows);
            }

            this.logger.info('Transactions retrieved successfully', {
                uid,
                count: transactions.length,
                isLastPage
            });

            res.status(200).json({
                data: transactions,
                is_last_page: isLastPage
            });
        } catch (error) {
            res.status(500).json(parseError(error, uid, this.entityName, 'retrieve'));
        }
    };

    protected updateEntity = (req: Request, res: Response<TransactionGetServer | CustomError>) => this.handleUpsert({
        req,
        res,
        entityName: this.entityName,
        schema: this.schemas.patch,
        responseSchema: this.schemas.get,
        buildQuery: this.buildPatchQuery,
        additionalValidation: this.validateCategory
    }, this.db, this.logger);

    protected buildPostQuery: QueryBuilder = ({fields, values, uid}) => {
        const allFields = [...fields, "user_uid"];
        const allValues = [...values, uid];
        const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
            WITH inserted AS (
                INSERT INTO ${this.tableName} (${allFields.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *)
            ${this.getBasicQuery('inserted')};
        `;

        return {query, queryValues: allValues};
    };

    protected buildPatchQuery: QueryIdBuilder = ({fields, values, uid, id}) => {
        let idx = 1;
        const setClauses = fields.map(f => `${f} = $${idx++}`);
        const uidPlaceholder = `$${idx++}`;
        const idPlaceholder = `$${idx}`;

        const query = `
            WITH updated AS (
                UPDATE ${this.tableName}
                    SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
                    RETURNING *)
            ${this.getBasicQuery('updated')};
        `;
        return {query, queryValues: [...values, uid, id]};
    };

    private validateCategory: Validator = async (db: DB, req: Request, uid: string) => {
        if (!isBody(req.body)) return {message: "Body of the request is missing"};
        if (!req.body.category_id || typeof req.body.category_id !== 'string') return {message: "Correct category is mandatory"};

        const catResult = await db.query(
            "SELECT id FROM categories WHERE id = $1 AND user_uid = $2",
            [req.body.category_id, uid]
        );

        if (catResult.rows.length === 0) return {
            message: "Invalid category",
            context: {categoryId: req.body.category_id}
        };
        return null;
    };
}