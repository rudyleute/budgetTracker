import {
    CounterpartiesGet,
    counterpartiesGetSchema,
    counterpartiesPatchSchema,
    counterpartiesPostSchema, CounterpartyGet, CounterpartyGetSchema,
    CounterpartiesRequestQuery, counterpartiesRequestQuerySchema,
    processCounterparties, CustomError, GetRes
} from "@app/shared";
import {DB} from "../utils/db";
import {Logger} from "../utils/logger";
import {Request, Response} from "express";
import {QueryParam} from "../types/controllers";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder} from "../types/controllers";
import {EntityController} from "./entity";

export class CounterpartiesController extends EntityController<CounterpartyGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'counterparty',
            tableName: 'counterparties',
            schemas: {
                get: counterpartiesGetSchema,
                post: counterpartiesPostSchema,
                patch: counterpartiesPatchSchema
            },
            getFields: counterpartiesGetSchema.omit({balance: true}).keyof().options
        });

        this.router.get('/', this.getCounterparties);
        this.router.get('/:id', this.getCounterpartyById);
    }

    protected getBasicQuery = (alias: string, userUidInd: number): string => {
        return `
            SELECT ${this.getQueryFields(alias)},
                   COALESCE(
                           SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
                           SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
                           0
                   ) AS balance
            FROM ${alias}
                     LEFT JOIN loans l ON ${alias}.id = l.counterparty_id AND l.user_uid = $${userUidInd} AND l.closed_at IS NULL
        `;
    };

    private getCounterparties = async (req: Request, res: Response<GetRes<CounterpartyGet> | CustomError>) => {
        const uid = req.user!.uid;

        try {
            const {
                filter,
                offset,
                limit
            }: CounterpartiesRequestQuery = counterpartiesRequestQuerySchema.parse(req.query);

            this.logger.debug('Fetching counterparties', {uid, offset, limit, filter});
            const params: QueryParam[] = [], cond: string[] = [];

            params.push(uid);
            cond.push(`${this.tableName}.user_uid = $${params.length}`);

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
                ${this.getBasicQuery(this.tableName, params.length - 2)}
                WHERE ${cond.join(' AND ')}
                    GROUP BY ${this.tableName}.id
                    ORDER BY balance DESC, ${this.tableName}.name
                ${limitClause}
                ${offsetClause};
            `;

            const result = await this.db.query(query, params);

            let counterparties: CounterpartiesGet, isLastPage: boolean;
            if (includeLimit) {
                isLastPage = result.rows.length <= realLimit;
                counterparties = processCounterparties(result.rows.slice(0, realLimit));
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
                ${this.getBasicQuery(this.tableName, 1)}
                WHERE ${this.tableName}.user_uid = $1
                  AND ${this.tableName}.id = $2
                GROUP BY ${this.tableName}.id
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
            ${this.getBasicQuery("inserted", allValues.length)}
            GROUP BY ${this.getQueryFields("inserted")};
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
            ${this.getBasicQuery("updated", idx)}
            GROUP BY ${this.getQueryFields("updated")};
        `;

        return {query, queryValues: [...values, uid, id]};
    };
}