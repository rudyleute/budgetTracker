const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 5,
  idleTimeout: 10000,
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

const query = (text, params) => pool.query(text, params);
const getClient = options => pool.connect(options);

module.exports = {
  query,
  getClient,
  pool
}