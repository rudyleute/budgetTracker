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
    const { from, to, filter, offset, limit } = req.query;

    logger.debug('Fetching transactions', { uid, offset, from, to, filter, limit });
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

    const rawLimit = Number(limit ?? 0);
    let effectiveLimit;
    let includeLimit = true;

    if (isNaN(rawLimit) || rawLimit === 0) effectiveLimit = pageSize;
    else if (rawLimit > 0) effectiveLimit = rawLimit;
    else includeLimit = false;

    if (includeLimit) params.push(effectiveLimit + 1);
    params.push(Number(offset ?? 0));

    const limitClause = includeLimit ? `LIMIT $${params.length - 1}` : "";
    const offsetClause = `OFFSET $${params.length}`;

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
        ${limitClause}
        ${offsetClause};
    `;

    const result = await db.query(query, params);

    let transactions, isLastPage;

    if (includeLimit) {
      isLastPage = result.rows.length <= effectiveLimit;
      transactions = result.rows.slice(0, effectiveLimit);
    } else {
      isLastPage = true;
      transactions = result.rows;
    }

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