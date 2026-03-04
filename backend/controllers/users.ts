import {BaseController} from "./base";
import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {Request, Response} from "express";
import {CustomError} from "../types/basic";
import {parseError} from "../utils/parsers";
import {UserGet, UserGetSchema, usersGetSchema} from "../types/components/users";
import {PoolClient} from "pg";
import admin from "../utils/firebase";

export class UsersController extends BaseController<UserGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'user',
            tableName: 'users',
        });

        this.router.get('/', this.getUser);
        this.router.post('/', this.createEntity);
        this.router.delete('/:id', this.deleteEntity);
    }

    private getUser = async (req: Request, res: Response<UserGet | CustomError>) => {
        const uid = req.user!.uid;

        try {
            this.logger.debug('Fetching a user', { uid });

            const result = await this.db.query(
                'SELECT uid, created_at FROM users WHERE uid = $1;',
                [uid]
            );

            if (result.rows.length === 0) {
                this.logger.warn('User has not been found', { uid });
                res.status(404).json({ message: 'User has not been found' });
                return;
            }

            this.logger.info('User retrieved successfully', { uid });

            res.json(usersGetSchema.parse(result.rows[0]));
        } catch (error) {
            res.status(500).json(parseError(error, uid, 'user', 'retrieve'));
        }
    };

    protected createEntity = async (req: Request, res: Response<UserGet | CustomError>) => {
        const uid = req.user!.uid;
        try {
            this.logger.info("Creating new user", { uid });

            const result = await this.db.query(
                "INSERT INTO users (uid) VALUES ($1) RETURNING *;",
                [uid]
            );

            this.logger.info('User created successfully', { uid });
            res.status(201).json(usersGetSchema.parse(result.rows[0]));
        } catch (error) {
            res.status(500).json(parseError(error, uid, 'user', 'create'));
        }
    };

    protected deleteEntity =  async (req: Request, res: Response<CustomError | void>) => {
        const uid = req.user!.uid;
        let client: PoolClient | undefined;

        try {
            client = await this.db.getClient();

            this.logger.info('Attempting to delete user', { uid });

            await client.query('BEGIN');

            const result = await client.query(
                'DELETE FROM users WHERE uid = $1 RETURNING *;',
                [uid]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                this.logger.warn('User not found for deletion', { uid });
                res.status(404).json({ message: "User has not been found" });
                return;
            }

            await admin.auth().deleteUser(uid); //delete the user from firebase as well
            await client.query('COMMIT');

            this.logger.info('User deleted successfully', { uid });
            res.status(204).send();
        } catch (error) {
            if (client) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    this.logger.error('Rollback failed', { rollbackError });
                }
            }
            res.status(500).json(parseError(error, uid, 'user', 'delete'));
        } finally {
            if (client) {
                try {
                    client.release();
                } catch (error) {
                    if (error instanceof Error) {
                        this.logger.error("Client's release failed", {
                            message: error.message,
                            stack: error.stack
                        });
                    } else this.logger.error("Client's release failed", { error });
                }
            }
        }
    };
}