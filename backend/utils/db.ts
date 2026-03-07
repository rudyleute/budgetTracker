import {Pool, PoolClient} from "pg";
import logger from "./logger";
import {QueryParam} from "../types/controllers";
import {checkRequired} from "./general";

export const pool = new Pool({
    user: checkRequired('DB_USER'),
    host: checkRequired('DB_HOST'),
    database: checkRequired('DB_DATABASE'),
    password: checkRequired('DB_PASSWORD'),
    port: Number(process.env.DB_PORT || 5432),
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000
});

pool.on('connect', () => logger.info('Database connection has been established'));

pool.on('error', (error) => {
    logger.error('Unexpected error on idle database client', {
        error: error.message,
        stack: error.stack
    });
    process.exit(-1);
});

const query = (text: string, params: QueryParam[]) => pool.query(text, params);
const getClient = (): Promise<PoolClient> => pool.connect();

const db = {
    query,
    getClient
};

export type DB = typeof db;
export default db;