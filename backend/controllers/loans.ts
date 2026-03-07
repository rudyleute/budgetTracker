import {
    loansGetSchema,
    loansPatchSchema,
    loansPostSchema, LoanGet,
    LoanGetSchema, LoansGet,
    LoansRequestQuery, loansRequestQuerySchema,
    CustomError, GetRes, processLoans
} from "@app/shared";
import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {Request, Response} from "express";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder, QueryParam, Validator} from "../types/controllers";
import {isBody} from "../utils/general";
import {EntityController} from "./entity";

export class LoansController extends EntityController<LoanGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'loan',
            tableName: 'loans',
            schemas: {
                get: loansGetSchema,
                post: loansPostSchema,
                patch: loansPatchSchema
            },
            getFields: loansGetSchema.omit({counterparty: true}).keyof().options
        });

        this.router.get('/', this.getLoans);
        this.router.get("/:id", this.getLoanById);
        this.router.patch("/:id/close", this.closeLoan);
    }

    protected updateEntity = (req: Request, res: Response<LoanGet | CustomError>) => this.handleUpsert({
        req,
        res,
        entityName: this.entityName,
        schema: this.schemas.patch,
        responseSchema: this.schemas.get,
        buildQuery: this.buildPatchQuery,
        additionalValidation: this.validateCounterparty
    }, this.db, this.logger);

    private getLoans = async (req: Request, res: Response<GetRes<LoanGet> | CustomError>) => {
        const uid = req.user!.uid;

        try {
            const {
                type: reqType, priority, sort, order = "DESC", from, to, offset, due, counterparty, limit
            }: LoansRequestQuery = loansRequestQuerySchema.parse(req.query);

            this.logger.debug(
                'Fetching loans',
                {uid, offset, reqType, priority, sort, order, from, to, due, limit, counterparty}
            );
            const params: QueryParam[] = [];

            const dateInd = params.length + 1;
            const {query: defaultQuery, date} = this.formDefaultSelectQuery(this.tableName, dateInd);

            params.push(date);
            const cond = [`${this.tableName}.user_uid = $${params.length + 1}`];
            params.push(uid);

            //'borrowed' or 'lent'
            if (reqType) {
                params.push(reqType);
                cond.push(`${this.tableName}.type = $${params.length}`);
            }
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
            if (priority) {
                params.push(priority);
                cond.push(`${this.tableName}.priority = $${params.length}`);
            }
            if (counterparty) {
                params.push(counterparty);
                cond.push(`${this.tableName}.counterparty_id = $${params.length}`);
            }
            //In this case we are only interested in the overdue and soon-to-be overdue deadlines
            if (due === "true") cond.push(`
              ${this.tableName}.closed_at IS NULL AND
              (${this.tableName}.priority = 'high' OR
              (${this.tableName}.deadline IS NOT NULL AND DATE(${this.tableName}.deadline) <= DATE($${dateInd})))`
            );

            let query = `
              ${defaultQuery}
              WHERE ${cond.join(' AND ')}
            `;

            let orderClause: string;
            //It should be possible to overwrite the default sorting by overdue, deadline and stuff via sort param
            if (sort) {
                const dir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
                orderClause = `ORDER BY ${this.tableName}.${sort} ${dir} NULLS LAST`;
            } else {
                /*Default sorting
                1 - non-closed loans are on top
                2 - overdue deadlines are on top
                3 - deadlines with the least time to be met/the most overdue ones are on top
                4 - deadlines in the order of importance from the most important to the least important/not set are on top
                5 - the most recently added loans are on top
                */
                orderClause = `
                    ORDER BY
                      ${this.tableName}.closed_at DESC NULLS FIRST,
                      CASE WHEN DATE(${this.tableName}.deadline) < CURRENT_DATE THEN 0 ELSE 1 END,
                      DATE(${this.tableName}.deadline) NULLS LAST,
                      CASE
                        WHEN ${this.tableName}.priority = 'high' THEN 1
                        WHEN ${this.tableName}.priority = 'medium' THEN 2
                        WHEN ${this.tableName}.priority = 'low' THEN 3
                        ELSE 4
                      END,
                      CASE WHEN ${this.tableName}.deadline IS NULL THEN ${this.tableName}.timestamp END DESC
                `;
            }

            const rawLimit = Number(limit ?? this.pageSize);
            let realLimit: number = 0, includeLimit = true;

            if (rawLimit > 0) realLimit = rawLimit;
            else includeLimit = false;

            if (includeLimit) params.push(realLimit + 1);
            params.push(Number(offset ?? 0));

            const limitClause = includeLimit ? `LIMIT $${params.length - 1}` : "";

            query += `\n
              ${orderClause}
              ${limitClause}
              OFFSET $${params.length};
            `;

            const result = await this.db.query(query, params);

            let loans: LoansGet, isLastPage;
            if (includeLimit) {
                isLastPage = result.rows.length <= realLimit;
                loans = processLoans(result.rows.slice(0, realLimit));
            } else {
                isLastPage = true;
                loans = processLoans(result.rows);
            }

            this.logger.info('Loans retrieved successfully', {
                uid,
                count: loans.length,
                isLastPage,
                dueFilter: due === 'true'
            });

            res.status(200).json({
                data: loans,
                is_last_page: isLastPage
            });
        } catch (error) {
            res.status(500).json(parseError(error, uid, this.entityName, 'retrieve'));
        }
    };

    private closeLoan = async (req: Request, res: Response<LoanGet | CustomError>) => {
        const uid = req.user!.uid;
        const id = req.params.id as string;

        try {
            this.logger.debug('Closing the loan', {uid, id});

            const {date, query: defaultQuery} = this.formDefaultSelectQuery('changed', 3);

            const result = await this.db.query(`
                    WITH changed AS (
                        UPDATE loans
                            SET closed_at = CURRENT_TIMESTAMP
                            WHERE user_uid = $1 AND id = $2 AND closed_at IS NULL
                            RETURNING *)
                    ${defaultQuery};
                `,
                [uid, id, date]
            );

            if (result.rows.length === 0) {
                this.logger.warn('Requested loan has not been updated', {uid, id});
                res.status(404).json({
                    message: "Requested loan has not been found"
                });
                return;
            }

            this.logger.info('Requested loan has been retrieved successfully', {
                uid,
                loan_id: id
            });

            res.status(200).json(loansGetSchema.parse(result.rows[0]));
            return;
        } catch (error) {
            res.status(500).json(parseError(error, uid, this.entityName, 'close', {id}));
        }
    };

    private getLoanById = async (req: Request, res: Response<LoanGet | CustomError>) => {
        const uid = req.user!.uid;
        const id = req.params.id as string;

        try {
            this.logger.debug('Fetching a loan', {uid, id});

            const {date, query: defaultQuery} = this.formDefaultSelectQuery(this.tableName, 3);

            const result = await this.db.query(
                `${defaultQuery}
                   WHERE ${this.tableName}.user_uid = $1
                     AND ${this.tableName}.id = $2
                   LIMIT 1;`,
                [uid, id, date]
            );

            if (result.rows.length === 0) {
                this.logger.warn('Requested loan has not been found', {uid, id});
                res.status(404).json({
                    message: "Requested loan has not been found"
                });
                return;
            }

            this.logger.info('Requested loan has been retrieved successfully', {
                uid,
                loan_id: id
            });

            res.status(200).json(loansGetSchema.parse(result.rows[0]));
            return;
        } catch (error) {
            res.status(500).json(parseError(error, uid, this.entityName, 'retrieve', {id}));
        }
    };

    protected formDefaultSelectQuery = (source: string, idx: number) => {
        //Calculate all the deadlines that are due to within 2 weeks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        twoWeeksFromNow.setHours(23, 59, 59, 999);

        return {
            query: `
                SELECT ${this.getQueryFields(source)},
                       json_build_object(
                               'id', cp.id,
                               'name', cp.name,
                               'email', cp.email,
                               'note', cp.note,
                               'phone', cp.phone
                       ) AS counterparty,
                       (CASE
                            WHEN ${source}.priority = 'high' THEN true
                            WHEN ${source}.closed_at IS NULL AND ${source}.deadline IS NOT NULL AND
                                 DATE(${source}.deadline) <= DATE($${idx}) THEN true
                            ELSE false
                       END) AS is_due /* All overdue loans and loans that will be overdue max in 2 weeks */
                FROM ${source}
                     LEFT JOIN counterparties cp ON ${source}.counterparty_id = cp.id /*the semicolon is purposefully omitted as the query might be expanded*/
            `,
            date: twoWeeksFromNow.toISOString()
        };
    };

    protected buildPostQuery: QueryBuilder = ({fields, values, uid}) => {
        const allFields = [...fields, "user_uid"];
        const allValues = [...values, uid];
        const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

        const source: string = 'changed';
        const defaultSelect = this.formDefaultSelectQuery(source, allValues.length + 1);
        allValues.push(defaultSelect.date); //date formed for calculating is_due

        const query = `
            WITH ${source} AS (
                INSERT INTO loans (${allFields.join(', ')})
                    VALUES (${placeholders})
            RETURNING *)
            ${defaultSelect.query};
        `;

        return {query, queryValues: allValues};
    };

    protected buildPatchQuery: QueryIdBuilder = ({fields, values, uid, id}) => {
        let idx = 1;
        const setClauses = fields.map(f => `${f} = $${idx++}`);

        const uidPlaceholder = `$${idx++}`;
        const idPlaceholder = `$${idx++}`;

        const source: string = 'changed';
        const defaultSelect = this.formDefaultSelectQuery(source, idx);

        const query = `
            WITH ${source} AS (
                UPDATE loans
                    SET ${setClauses.join(', ')}
                    WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
                    RETURNING *)
            ${defaultSelect.query};
        `;

        return {query, queryValues: [...values, uid, id, defaultSelect.date]};
    };

    private validateCounterparty: Validator = async (db: DB, req: Request, uid: string) => {
        if (!isBody(req.body)) return {message: "Body of the request is missing"};
        if (!req.body.counterparty_id || typeof req.body.counterparty_id !== 'string') return {message: "Correct counterparty is mandatory"};

        const cpResult = await db.query(
            'SELECT id FROM counterparties WHERE id = $1 AND user_uid = $2',
            [req.body.counterparty_id, uid]
        );

        if (cpResult.rows.length === 0) return { message: "Invalid counterparty", context: {counterpartyId: req.body.counterparty_id}};
        return null;
    };
}