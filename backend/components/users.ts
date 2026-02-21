import express from 'express';
import {query, getClient} from '../utils/db';
import admin from '../utils/firebase';
import logger from '../utils/logger';
import {UserGet, UserPost} from "../types/users";
import {Response, Request} from "express";
import {convertToUserGet, convertToUserPost} from "../utils/entities/users";
import {CustomError} from "../types/basic";
import {isUser} from "../utils/general";
import {PoolClient} from "pg";
import {parseError} from "../utils/parsers";

const router = express.Router();

const getUser = async (req: Request, res: Response<UserGet | CustomError>) => {
    if (!isUser(req, res)) return;
    try {
        const uid = req.user.uid;
        logger.debug('Fetching a user', { uid });

        const result = await query(
            'SELECT uid, created_at FROM users WHERE uid = $1;',
            [uid]
        );

        if (result.rows.length === 0) {
            logger.warn('User has not been found', { uid });
            res.status(404).json({ message: 'User has not been found' });
            return;
        }

        logger.info('User retrieved successfully', { uid });

        res.json(convertToUserGet(result.rows[0]));
    } catch (error) {
        res.status(500).json(parseError(error, req.user.uid, 'user', 'retrieve'));
    }
};

const createUser = async (req: Request, res: Response<UserPost | CustomError>) => {
    if (!isUser(req, res)) return;
    try {
        const uid = req.user.uid;

        logger.info("Creating new user", { uid });

        const result = await query(
            "INSERT INTO users (uid) VALUES ($1) RETURNING *;",
            [uid]
        );

        logger.info('User created successfully', { uid });
        res.status(201).json(convertToUserPost(result.rows[0]));
    } catch (error) {
        res.status(500).json(parseError(error, req.user.uid, 'user', 'create'));
    }
};

const deleteUser =  async (req: Request, res: Response<CustomError | void>) => {
    if (!isUser(req, res)) return;
    let client: PoolClient | undefined;

    try {
        const uid = req.user.uid;
        client = await getClient();

        logger.info('Attempting to delete user', { uid });

        await client.query('BEGIN');

        const result = await client.query(
            'DELETE FROM users WHERE uid = $1 RETURNING *;',
            [uid]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            logger.warn('User not found for deletion', { uid });
            res.status(404).json({ message: "User has not been found" });
            return;
        }

        await admin.auth().deleteUser(uid); //delete the user from firebase as well
        await client.query('COMMIT');

        logger.info('User deleted successfully', { uid });
        res.status(204).send();
    } catch (error) {
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                logger.error('Rollback failed', { rollbackError });
            }
        }
        res.status(500).json(parseError(error, req.user.uid, 'user', 'delete'));
    } finally {
        if (client) {
            try {
                client.release();
            } catch (error) {
                if (error instanceof Error) {
                    logger.error("Client's release failed", {
                        message: error.message,
                        stack: error.stack
                    });
                } else logger.error("Client's release failed", { error });
            }
        }
    }
};

router.get('/', getUser);
router.post('/',createUser);
router.delete('/', deleteUser);

export default router;