import {DB} from "../utils/db";
import {Logger} from "../utils/logger";
import {Request, Response} from "express";
import {CustomError, GetRes, QueryParam} from "../types/basic";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder, Validator} from "../types/components";
import {EntityController} from "./entity";
import {
    transactionsGetSchema,
    transactionsPatchSchema,
    transactionsPostSchema,
    TransactionGetSchema,
    TransactionGet, TransactionsRequestQuery, transactionsRequestQuerySchema, TransactionsGet
} from "../types/components/transactions";
import {isBody} from "../utils/general";
import {processTransactions} from "../utils/processers";

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
            }
        });

        this.router.get('/', this.getTransactions);
    }

    private getTransactions = async (req: Request, res: Response<GetRes<TransactionGet> | CustomError>) => {
        const uid = req.user!.uid;
        try {
            const { from, to, filter, offset, limit }: TransactionsRequestQuery = transactionsRequestQuerySchema.parse(req.query);

            this.logger.debug('Fetching transactions', { uid, offset, from, to, filter, limit });
            const params: QueryParam[] = [uid], cond: string[] = ["t.user_uid = $1"];

            if (from) {
                params.push(from);
                cond.push(`t.timestamp >= $${params.length}`);
            }
            if (to) {
                const nextDay = new Date(to);
                nextDay.setDate(nextDay.getDate() + 1);
                params.push(nextDay.toISOString());
                cond.push(`t.timestamp < $${params.length}`);
            }
            if (filter) {
                params.push(`%${filter}%`);
                cond.push(`LOWER(t.name) LIKE LOWER($${params.length})`);
            }

            const rawLimit = Number(limit ?? 0);
            let effectiveLimit: number = 0;
            let includeLimit = true;

            if (isNaN(rawLimit) || rawLimit === 0) effectiveLimit = this.pageSize;
            else if (rawLimit > 0) effectiveLimit = rawLimit;
            else includeLimit = false;

            if (includeLimit) params.push(effectiveLimit + 1);
            params.push(Number(offset ?? 0));

            const limitClause = includeLimit ? `LIMIT $${params.length - 1}` : "";
            const offsetClause = `OFFSET $${params.length}`;

            const query = `
                SELECT t.id,
                       t.timestamp,
                       t.created_at,
                       t.updated_at,
                       t.name,
                       t.price,
                       json_build_object(
                               'id', c.id,
                               'name', c.name,
                               'color', c.color
                       ) AS category
                FROM transactions t
                         LEFT JOIN categories c ON t.category_id = c.id
                    where ${cond.join(' AND ')}
                ORDER BY t.timestamp DESC
                ${limitClause}
                ${offsetClause};
            `;

            const result = await this.db.query(query, params);

            let transactions: TransactionsGet, isLastPage: boolean;
            if (includeLimit) {
                isLastPage = result.rows.length <= effectiveLimit;
                transactions = processTransactions(result.rows.slice(0, effectiveLimit));
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

    protected updateEntity = (req: Request, res: Response<TransactionGet | CustomError>) => this.handleUpsert({
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
                INSERT INTO transactions (${allFields.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *
            )
            SELECT inserted.id,
                   inserted.timestamp,
                   inserted.created_at,
                   inserted.updated_at,
                   inserted.name,
                   inserted.price,
                   json_build_object(
                           'id', c.id,
                           'name', c.name,
                           'color', c.color
                   ) AS category
            FROM inserted
                     LEFT JOIN categories c ON inserted.category_id = c.id;
        `;

        return { query, queryValues: allValues };
    };

    protected buildPatchQuery: QueryIdBuilder = ({fields, values, uid, id}) => {
        let idx = 1;
        const setClauses = fields.map(f => `${f} = $${idx++}`);
        const uidPlaceholder = `$${idx++}`;
        const idPlaceholder = `$${idx}`;

        const query = `
          WITH updated AS (
            UPDATE transactions
            SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
            WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
            RETURNING *
          )
          SELECT updated.id,
                 updated.timestamp,
                 updated.created_at,
                 updated.updated_at,
                 updated.name,
                 updated.price,
                 json_build_object(
                   'id', c.id,
                   'name', c.name,
                   'color', c.color
                 ) AS category
          FROM updated
          LEFT JOIN categories c ON updated.category_id = c.id;
        `;
        return { query, queryValues: [...values, uid, id] };
    };

    private validateCategory: Validator = async (db: DB, req: Request, uid: string) => {
        if (!isBody(req.body)) return {message: "Body of the request is missing"};
        if (!req.body.category_id || typeof req.body.category_id !== 'string') return {message: "Correct category is mandatory"};

        const catResult = await db.query(
            "SELECT id FROM categories WHERE id = $1 AND user_uid = $2",
            [req.body.category_id, uid]
        );

        if (catResult.rows.length === 0) return {message: "Invalid category", context: {categoryId: req.body.category_id}};
        return null;
    };
}