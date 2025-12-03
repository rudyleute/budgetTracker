const express = require('express');
const db = require('../db');
const router = express.Router();
const logger = require('../logger')
const { handleDelete, handleUpsert, validateCategory } = require('./generic');
const { buildPostQuery, buildPatchQuery } = require('../helpers/transactions.query');

const pageSize = 30;
const reqAllowedFields = ["name", "price", "timestamp", "category_id"];

router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { from, to, filter, offset } = req.query;

    logger.debug('Fetching transactions', { uid, offset, from, to, filter });
    const params = [uid], cond = ["t.user_uid = $1"];

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

    params.push(pageSize + 1);
    params.push(Number(offset ?? 0));

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
        LIMIT $${params.length - 1}
        OFFSET $${params.length};
    `;

    const result = await db.query(query, params);

    const isLastPage = result.rows.length <= pageSize;
    const transactions = result.rows.slice(0, pageSize);

    logger.info('Transactions retrieved successfully', {
      uid,
      count: transactions.length,
      isLastPage
    });

    return res.status(200).json({
      data: transactions,
      is_last_page: isLastPage
    });
  } catch (error) {
    logger.error('Failed to retrieve transactions', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to retrieve transactions" });
  }
})

router.post('/', (req, res) =>
  handleUpsert({
    req,
    res,
    entityName: "transaction",
    reqAllowedFields,
    optAllowedFields: [],
    additionalValidation: validateCategory,
    buildQuery: buildPostQuery
  }, db, logger)
);

router.patch('/:id', (req, res) =>
  handleUpsert({
    req,
    res,
    entityName: "transaction",
    reqAllowedFields,
    optAllowedFields: [],
    buildQuery: buildPatchQuery
  }, db, logger)
);

router.delete('/:id', (req, res) =>
  handleDelete({
    table: 'transactions',
    idField: 'id',
    entityName: 'transaction',
    req,
    res,
  }, db, logger)
);

module.exports = router;