import express from "express";
import db from '../utils/db';
import logger from "../utils/logger";
import {handleDelete, handleUpsert} from "./generic";
import {buildPostQuery, buildPatchQuery} from '../helpers/counterpartiesQuery';
import {CounterpartiesGet, CounterpartyGet} from "../types/components/counterparties";
import { counterpartiesGetSchema, counterpartiesPatchSchema, counterpartiesPostSchema } from "../types/components/counterparties";
import {CustomError, GetRes, QueryParam, RequestQuery} from "../types/basic";
import {isUser} from "../utils/general";
import {Request, Response} from "express";
import {parseError} from "../utils/parsers";
import {processCounterparties} from "../utils/processers";

const entityName = "counterparty";
const router = express.Router();
const pageSize: number = 30;

const getCounterparties = async (req: Request, res: Response<GetRes | CustomError>) => {
    if (!isUser(req, res)) return;

    try {
        const uid = req.user.uid;
        const {filter, offset, limit, balance}: RequestQuery = req.query;


        logger.debug('Fetching counterparties', {uid, balance, offset, limit, filter});
        const params: QueryParam[] = [], cond: string[] = [];

        params.push(uid);
        cond.push(`cp.user_uid = $${params.length}`);

        if (filter) {
            params.push(`%${filter}%`);
            cond.push(`LOWER(cp.name) LIKE LOWER($${params.length})`);
        }

        const rawLimit: number = Number(limit ?? 0);
        let effectiveLimit: number = 0, includeLimit = true;

        if (isNaN(rawLimit) || rawLimit === 0) effectiveLimit = pageSize;
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

        const result = await db.query(query, params);

        let counterparties: CounterpartiesGet, isLastPage: boolean;
        if (includeLimit) {
            isLastPage = result.rows.length <= effectiveLimit;
            counterparties = processCounterparties(result.rows.slice(0, effectiveLimit));
        } else {
            isLastPage = true;
            counterparties = processCounterparties(result.rows);
        }

        logger.info('Counterparties retrieved successfully', {
            uid,
            count: counterparties.length,
            isLastPage
        });

        res.status(200).json({
            data: counterparties,
            is_last_page: isLastPage
        });
    } catch (error) {
        res.status(500).json(parseError(error, req.user.uid, entityName, 'retrieve'));
    }
};
const getCounterpartyById = async (req: Request, res: Response<CounterpartyGet | CustomError>) => {
    if (!isUser(req, res)) return;

    const uid = req.user.uid;
    const id = req.params.id as string;
    try {
        logger.debug('Fetching counterparties', {uid});

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

        const result = await db.query(query, [uid, id]);

        if (result.rows.length === 0) {
            logger.warn('Requested counterparty has not been found', {uid, id});
            res.status(404).json({message: "Requested counterparty has not been found"});
            return;
        }

        logger.info('Requested counterparty has been retrieved successfully', {uid, id});

        res.status(200).json(counterpartiesGetSchema.parse(result.rows[0]));
    } catch (error) {
        res.status(500).json(parseError(error, req.user.uid, entityName, 'retrieve', {id}));
    }
};
const createCounterparty = (req: Request, res: Response<CounterpartyGet | CustomError>) => handleUpsert({
    req,
    res,
    schema: counterpartiesPostSchema,
    responseSchema: counterpartiesGetSchema,
    entityName,
    buildQuery: buildPostQuery
}, db, logger);
const updateCounterparty = (req: Request, res: Response<CounterpartyGet | CustomError>) => handleUpsert({
    req,
    res,
    entityName,
    schema: counterpartiesPatchSchema,
    responseSchema: counterpartiesGetSchema,
    buildQuery: buildPatchQuery
}, db, logger);
const deleteCounterparty = (req: Request, res: Response<CustomError | void>) => handleDelete({
    table: 'counterparties',
    idField: 'id',
    entityName,
    req,
    res
}, db, logger);

router.get('/', getCounterparties);
router.get('/:id', getCounterpartyById);
router.post('/', createCounterparty);
router.patch('/:id', updateCounterparty);
router.delete('/:id', deleteCounterparty);

export default router;
