import {BaseController} from "./base";
import {
    CounterpartiesGet,
    counterpartiesGetSchema,
    counterpartiesPatchSchema,
    counterpartiesPostSchema, CounterpartiesRequestQuery,
    counterpartiesRequestQuerySchema, CounterpartyGet, CounterpartyGetSchema
} from "../types/components/counterparties";
import {DB} from "../utils/db";
import {Logger} from "../utils/logger";
import {Request, Response} from "express";
import {CustomError, GetRes, QueryParam} from "../types/basic";
import {processCounterparties} from "../utils/processers";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder} from "../types/components";

export class CounterpartiesController extends BaseController<CounterpartyGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'counterparty',
            tableName: 'counterparties',
            schemas: {
                get: counterpartiesGetSchema,
                post: counterpartiesPostSchema,
                patch: counterpartiesPatchSchema
            }
        });

        this.router.get('/', this.getCounterparties);
        this.router.get('/:id', this.getCounterpartyById);
    }

    private getCounterparties = async (req: Request, res: Response<GetRes<CounterpartyGet> | CustomError>) => {
        const uid = req.user!.uid;

        try {
            const {filter, offset, limit, balance}: CounterpartiesRequestQuery = counterpartiesRequestQuerySchema.parse(req.query);

            this.logger.debug('Fetching counterparties', {uid, balance, offset, limit, filter});
            const params: QueryParam[] = [], cond: string[] = [];

            params.push(uid);
            cond.push(`cp.user_uid = $${params.length}`);

            if (filter) {
                params.push(`%${filter}%`);
                cond.push(`LOWER(cp.name) LIKE LOWER($${params.length})`);
            }

            const rawLimit: number = Number(limit ?? 0);
            let effectiveLimit: number = 0, includeLimit = true;

            if (isNaN(rawLimit) || rawLimit === 0) effectiveLimit = this.pageSize;
            else if (rawLimit > 0) effectiveLimit = rawLimit;
            else includeLimit = false;

            if (includeLimit) params.push(effectiveLimit + 1);
            params.push(Number(offset ?? 0));

            const limitClause = includeLimit ? `LIMIT $${params.length - 1}` : "";
            const offsetClause = `OFFSET $${params.length}`;

            let query;
            if (balance) {
                query = `
                    SELECT cp.id,
                           cp.name,
                           cp.email,
                           cp.phone,
                           cp.note,
                           COALESCE(
                                   SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
                                   SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
                                   0
                           ) AS balance
                    FROM counterparties cp
                             LEFT JOIN loans l ON cp.id = l.counterparty_id AND l.user_uid = $${params.length - 2} AND l.closed_at IS NULL
                    WHERE ${cond.join(' AND ')}
                        GROUP BY cp.id
                        ORDER BY balance DESC, cp.name
                `;
            } else {
                query = `
                    SELECT id, name, email, note, phone
                    FROM counterparties cp
                    WHERE ${cond.join(' AND ')}
                    ORDER BY name
                `;
            }
            query = `
              ${query}
              ${limitClause}
              ${offsetClause};
            `;

            const result = await this.db.query(query, params);

            let counterparties: CounterpartiesGet, isLastPage: boolean;
            if (includeLimit) {
                isLastPage = result.rows.length <= effectiveLimit;
                counterparties = processCounterparties(result.rows.slice(0, effectiveLimit));
            } else {
                isLastPage = true;
                counterparties = processCounterparties(result.rows);
            }

            this.logger.info('Counterparties retrieved successfully', {
                uid,
                count: counterparties.length,
                isLastPage
            });

            res.status(200).json({
                data: counterparties,
                is_last_page: isLastPage
            });
        } catch (error) {
            res.status(500).json(parseError(error, uid, this.entityName, 'retrieve'));
        }
    };

    private getCounterpartyById = async (req: Request, res: Response<CounterpartyGet | CustomError>) => {
        const uid = req.user!.uid;
        const id = req.params.id as string;
        try {
            this.logger.debug('Fetching counterparties', {uid});

            const query = `
                SELECT cp.id,
                       cp.name,
                       cp.email,
                       cp.phone,
                       cp.note,
                       COALESCE(
                               SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
                               SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
                               0
                       ) AS balance
                FROM counterparties cp
                         LEFT JOIN loans l ON cp.id = l.counterparty_id AND l.user_uid = $1 AND l.closed_at IS NULL
                WHERE cp.user_uid = $1
                  AND cp.id = $2
                GROUP BY cp.id
                LIMIT 1;`;

            const result = await this.db.query(query, [uid, id]);

            if (result.rows.length === 0) {
                this.logger.warn('Requested counterparty has not been found', {uid, id});
                res.status(404).json({message: "Requested counterparty has not been found"});
                return;
            }

            this.logger.info('Requested counterparty has been retrieved successfully', {uid, id});

            res.status(200).json(counterpartiesGetSchema.parse(result.rows[0]));
        } catch (error) {
            res.status(500).json(parseError(error, uid, this.entityName, 'retrieve', {id}));
        }
    };

    protected buildPostQuery: QueryBuilder = ({fields, values, uid}) => {
        const allFields = [...fields, "user_uid"];
        const allValues = [...values, uid];
        const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
            WITH inserted AS (
                INSERT INTO counterparties (${allFields.join(", ")})
                    VALUES (${placeholders})
                    RETURNING *)
            SELECT inserted.id,
                   inserted.name,
                   inserted.email,
                   inserted.phone,
                   inserted.note,
                   COALESCE(
                           SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
                           SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
                           0
                   ) AS balance
            FROM inserted
                     LEFT JOIN loans l ON inserted.id = l.counterparty_id AND l.user_uid = $${allValues.length} AND l.closed_at IS NULL
            GROUP BY inserted.id, inserted.name, inserted.email, inserted.phone, inserted.note;
        `;

        return {query, queryValues: allValues};
    };

    protected buildPatchQuery: QueryIdBuilder = ({fields, values, uid, id}) => {
        let idx = 1;
        const setClauses = fields.map(f => `${f} = $${idx++}`);

        const query = `
            WITH updated AS (
                UPDATE counterparties
                    SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_uid = $${idx} AND id = $${idx + 1}
                  RETURNING *)
            SELECT updated.id,
                   updated.name,
                   updated.email,
                   updated.phone,
                   updated.note,
                   COALESCE(
                           SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
                           SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
                           0
                   ) AS balance
            FROM updated
                     LEFT JOIN loans l ON updated.id = l.counterparty_id AND l.user_uid = $${idx} AND l.closed_at IS NULL
                      GROUP BY updated.id, updated.name, updated.email, updated.phone, updated.note;
        `;

        return {query, queryValues: [...values, uid, id]};
    };
}