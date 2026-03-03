import {BaseController} from "./base";
import {
    loansGetSchema,
    loansPatchSchema,
    loansPostSchema, LoanGet,
    LoanGetSchema, loansRequestQuerySchema, LoansRequestQuery, LoansGet
} from "../types/components/loans";
import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {Request, Response} from "express";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder, Validator} from "../types/components";
import {GetRes, QueryParam} from "../types/basic";
import {CustomError} from "../types/basic";
import {processLoans} from "../utils/processers";
import {isBody} from "../utils/general";

export class LoansController extends BaseController<LoanGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'loan',
            tableName: 'loans',
            schemas: {
                get: loansGetSchema,
                post: loansPostSchema,
                patch: loansPatchSchema
            }
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
            const {query: defaultQuery, date, alias} = this.formDefaultSelectQuery(false, dateInd);
            params.push(date);
            const cond = [`${alias}.user_uid = $${params.length + 1}`];
            params.push(uid);

            //'borrowed' or 'lent'
            if (reqType) {
                params.push(reqType);
                cond.push(`${alias}.type = $${params.length}`);
            }
            if (from) {
                params.push(from);
                cond.push(`${alias}.timestamp >= $${params.length}`);
            }
            if (to) {
                const nextDay = new Date(to);
                nextDay.setDate(nextDay.getDate() + 1);
                params.push(nextDay.toISOString());
                cond.push(`${alias}.timestamp < $${params.length}`);
            }
            if (priority) {
                params.push(priority);
                cond.push(`${alias}.priority = $${params.length}`);
            }
            if (counterparty) {
                params.push(counterparty);
                cond.push(`${alias}.counterparty_id = $${params.length}`);
            }
            //In this case we are only interested in the overdue and soon-to-be overdue deadlines
            if (due === "true") cond.push(`
              ${alias}.closed_at IS NULL AND
              (${alias}.priority = 'high' OR
              (${alias}.deadline IS NOT NULL AND DATE(${alias}.deadline) <= DATE($${dateInd})))`
            );

            let query = `
              ${defaultQuery}
              WHERE ${cond.join(' AND ')}
            `;

            let orderClause = ``;
            //It should be possible to overwrite the default sorting by overdue, deadline and stuff via sort param
            if (sort) {
                const dir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
                orderClause = `ORDER BY ${alias}.${sort} ${dir} NULLS LAST`;
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
                      ${alias}.closed_at DESC NULLS FIRST,
                      CASE WHEN DATE(${alias}.deadline) < CURRENT_DATE THEN 0 ELSE 1 END,
                      DATE(${alias}.deadline) NULLS LAST,
                      CASE
                        WHEN ${alias}.priority = 'high' THEN 1
                        WHEN ${alias}.priority = 'medium' THEN 2
                        WHEN ${alias}.priority = 'low' THEN 3
                        ELSE 4
                      END,
                      CASE WHEN ${alias}.deadline IS NULL THEN ${alias}.timestamp END DESC
                `;
            }

            const rawLimit = Number(limit ?? 0);
            let effectiveLimit: number = this.pageSize;
            let includeLimit = true;

            if (isNaN(rawLimit) || rawLimit === 0) effectiveLimit = this.pageSize;
            else if (rawLimit > 0) effectiveLimit = rawLimit;
            else includeLimit = false;

            if (includeLimit) params.push(effectiveLimit + 1);
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
                isLastPage = result.rows.length <= effectiveLimit;
                loans = processLoans(result.rows.slice(0, effectiveLimit));
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
            parseError(error, uid, this.entityName, 'retrieve');
        }
    };

    private closeLoan = async (req: Request, res: Response<LoanGet | CustomError>) => {
        const uid = req.user!.uid;
        const id = req.params.id as string;

        try {
            this.logger.debug('Closing the loan', {uid, id});

            const {date, query: defaultQuery} = this.formDefaultSelectQuery(true, 3);

            const result = await this.db.query(
                `WITH changed AS (
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

            const {date, query: defaultQuery, alias} = this.formDefaultSelectQuery(false, 3);

            const result = await this.db.query(
                `${defaultQuery}
                   WHERE ${alias}.user_uid = $1
                     AND ${alias}.id = $2
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

    private formDefaultSelectQuery = (isChanged = false, dateParamNumber: number) => {
        const table = isChanged ? "changed" : "loans"; //helps to prevent potential injections as the parameter is not pasted directly
        const alias = 't';

        //Calculate all the deadlines that are due to within 2 weeks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        twoWeeksFromNow.setHours(23, 59, 59, 999);

        return {
            query: `
                SELECT ${alias}.id,
                       ${alias}.name,
                       ${alias}.timestamp,
                       ${alias}.deadline,
                       ${alias}.priority,
                       ${alias}.type,
                       ${alias}.sum,
                       ${alias}.closed_at,
                       json_build_object(
                               'id', cp.id,
                               'name', cp.name,
                               'email', cp.email,
                               'note', cp.note,
                               'phone', cp.phone
                       ) AS counterparty,
                       (CASE
                            WHEN ${alias}.priority = 'high' THEN true
                            WHEN ${alias}.closed_at IS NULL AND ${alias}.deadline IS NOT NULL AND
                                 DATE(${alias}.deadline) <= DATE($${dateParamNumber}) THEN true
                            ELSE false
                       END) AS is_due /* All overdue loans and loans that will be overdue max in 2 weeks */
                FROM ${table} as ${alias}
                     LEFT JOIN counterparties cp ON ${alias}.counterparty_id = cp.id /*the semicolon is purposefully omitted as the query might be expanded*/
            `,
            alias,
            date: twoWeeksFromNow.toISOString()
        };
    };

    protected buildPostQuery: QueryBuilder = ({fields, values, uid}) => {
        const allFields = [...fields, "user_uid"];
        const allValues = [...values, uid];
        const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

        const defaultSelect = this.formDefaultSelectQuery(true, allValues.length + 1);
        allValues.push(defaultSelect.date); //date formed for calculating is_due

        const query = `
            WITH changed AS (
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

        const defaultSelect = this.formDefaultSelectQuery(true, idx);

        const query = `
            WITH changed AS (
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