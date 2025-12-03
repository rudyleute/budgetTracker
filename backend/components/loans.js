const express = require('express');
const db = require('../db');
const router = express.Router();
const logger = require('../logger')
const { handleDelete, handleUpsert, validateCounterparty } = require('./generic');
const { buildPostQuery, buildPatchQuery } = require('../helpers/loans.query');

const pageSize = 30;
const optAllowedFields = ["deadline", "priority"]
const reqAllowedFields = ["name", "timestamp", "counterparty_id", "type", "price"];

router.get('/types', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT enumlabel AS type
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'loan_types'
      ORDER BY enumsortorder;
    `);
    res.status(200).json(result.rows.map(r => r.type));
  } catch (error) {
    logger.error("Failed to load loan_types", error);
    res.status(500).json({ message: "Failed to load loan types" });
  }
});

router.get('/priorities', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT enumlabel AS priority
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'priority_types'
      ORDER BY enumsortorder;
    `);
    res.status(200).json(result.rows.map(r => r.priority));
  } catch (error) {
    logger.error("Failed to load priority_types", error);
    res.status(500).json({ message: "Failed to load priority types" });
  }
});

router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type: reqType, priority, sort, order = "DESC", from, to, offset, due, limit } = req.query;

    logger.debug('Fetching loans', { uid, offset, reqType, priority, sort, order, from, to, due, limit });
    const params = [];

    params.push(uid);

    //Calculate all the deadlines that are due to within 2 weeks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    twoWeeksFromNow.setHours(23, 59, 59, 999);
    params.push(twoWeeksFromNow.toISOString());

    const cond = ["l.user_uid = $1"];

    //'borrowed' or 'lent'
    if (reqType) {
      params.push(reqType);
      cond.push(`l.type = $${params.length}`);
    }
    if (from) {
      params.push(from);
      cond.push(`l.timestamp >= $${params.length}`);
    }
    if (to) {
      const nextDay = new Date(to);
      nextDay.setDate(nextDay.getDate() + 1);
      params.push(nextDay.toISOString());
      cond.push(`l.timestamp < $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      cond.push(`l.priority = $${params.length}`);
    }
    //In this case we are only interested in the overdue and soon-to-be overdue deadlines
    if (due === "true") cond.push(`(l.priority = 'high' OR (l.deadline IS NOT NULL AND DATE(l.deadline) <= DATE($2)))`)

    let query = `
      SELECT
        l.id,
        l.name,
        l.timestamp,
        l.deadline,
        l.type,
        l.priority,
        l.price,
        json_build_object(
          'id', cp.id,
          'name', cp.name,
          'email', cp.email,
          'note', cp.note,
          'phone', cp.phone
        ) AS counterparty,
        (CASE
             WHEN l.priority = 'high' THEN true
             WHEN l.deadline IS NOT NULL AND DATE(l.deadline) <= DATE($2) THEN true
             ELSE false
        END) AS is_due /* All overdue loans and loans that will be overdue max in 2 weeks */
      FROM loans l
      LEFT JOIN counterparties cp ON l.counterparty_id = cp.id
      WHERE ${cond.join(' AND ')}
    `;

    let orderClause = ``;
    const sortable = ["timestamp", "deadline", "name", "priority", "type"];

    //It should be possible to overwrite the default sorting by overdue, deadline and stuff via sort param
    if (sort && sortable.includes(sort)) {
      const dir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderClause = `ORDER BY l.${sort} ${dir} NULLS LAST`;
    } else {
      /*Default sorting
      1 - overdue deadlines are on top
      2 - deadlines with the least time to be met/the most overdue ones are on top
      3 - deadlines in the order of importance from the most important to the least important/not set are on top
      4 - the most recently added loans are on top
      */
      orderClause = `
        ORDER BY
          CASE WHEN DATE(l.deadline) < CURRENT_DATE THEN 0 ELSE 1 END,
          DATE(l.deadline) NULLS LAST,
          CASE
            WHEN l.priority = 'high' THEN 1
            WHEN l.priority = 'medium' THEN 2
            WHEN l.priority = 'low' THEN 3
            ELSE 4
          END,
          CASE WHEN l.deadline IS NULL THEN l.timestamp END DESC
      `;
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

    query += `\n
      ${orderClause}
      ${limitClause}
      OFFSET $${params.length};
    `;

    const result = await db.query(query, params);

    let loans, isLastPage;
    if (includeLimit) {
      isLastPage = result.rows.length <= effectiveLimit;
      loans = result.rows.slice(0, effectiveLimit);
    } else {
      isLastPage = true;
      loans = result.rows;
    }

    logger.info('Loans retrieved successfully', {
      uid,
      count: loans.length,
      isLastPage,
      dueFilter: due === 'true'
    });

    return res.status(200).json({
      data: loans,
      is_last_page: isLastPage
    });
  } catch (error) {
    logger.error('Failed to retrieve loans', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to retrieve loans" });
  }
});

router.post('/', (req, res) => handleUpsert({
  req,
  res,
  entityName: 'loan',
  reqAllowedFields,
  optAllowedFields,
  additionalValidation: validateCounterparty,
  buildQuery: buildPostQuery
}, db, logger));

router.patch('/:id', (req, res) => handleUpsert({
  req,
  res,
  entityName: 'loan',
  reqAllowedFields,
  optAllowedFields,
  buildQuery: buildPatchQuery
}, db, logger));

router.delete('/:id', (req, res) =>
  handleDelete({
    table: 'loans',
    idField: 'id',
    entityName: 'loan',
    req,
    res
  }, db, logger)
);

module.exports = router;