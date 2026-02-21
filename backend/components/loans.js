const express = require('express');
const db = require('../utils/db');
const router = express.Router();
const logger = require('../utils/logger')
const { handleDelete, handleUpsert, validateCounterparty } = require('./generic');
const { buildPostQuery, buildPatchQuery, formDefaultSelectQuery } = require('../helpers/loans.query');

const pageSize = 30;
const optAllowedFields = ["deadline", "priority"] //closed_at should not be processed should it come from the frontend. A separate route handles that
const reqAllowedFields = ["name", "timestamp", "counterparty_id", "type", "sum"];

router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type: reqType, priority, sort, order = "DESC", from, to, offset, due, counterparty, limit } = req.query;

    logger.debug('Fetching loans', { uid, offset, reqType, priority, sort, order, from, to, due, limit, counterparty });
    const params = [];

    const dateInd = params.length + 1
    const { query: defaultQuery, date, alias } = formDefaultSelectQuery(false, dateInd);
    params.push(date);
    const cond = [`${alias}.user_uid = $${params.length + 1}`];
    params.push(uid)

    //'borrowed' or 'lent'
    if (reqType) {
      params.push(reqType);
      cond.push(`${alias}.type = $${params.length}`);
    }
    if (from) {
      params.push(from);
      cond.push(`${alias}.timestamp >= $${params.length}`);
    }
    if (to) {
      const nextDay = new Date(to);
      nextDay.setDate(nextDay.getDate() + 1);
      params.push(nextDay.toISOString());
      cond.push(`${alias}.timestamp < $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      cond.push(`${alias}.priority = $${params.length}`);
    }
    if (counterparty) {
      params.push(counterparty);
      cond.push(`${alias}.counterparty_id = $${params.length}`);
    }
    //In this case we are only interested in the overdue and soon-to-be overdue deadlines
    if (due === "true") cond.push(`
      ${alias}.closed_at IS NULL AND
      (${alias}.priority = 'high' OR
      (${alias}.deadline IS NOT NULL AND DATE(${alias}.deadline) <= DATE($${dateInd})))`
    )

    let query = `
      ${defaultQuery}
      WHERE ${cond.join(' AND ')}
    `;

    let orderClause = ``;
    const sortable = ["timestamp", "deadline", "name", "priority", "type"];

    //It should be possible to overwrite the default sorting by overdue, deadline and stuff via sort param
    if (sort && sortable.includes(sort)) {
      const dir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderClause = `ORDER BY ${alias}.${sort} ${dir} NULLS LAST`;
    } else {
      /*Default sorting
      1 - non-closed loans are on top
      2 - overdue deadlines are on top
      3 - deadlines with the least time to be met/the most overdue ones are on top
      4 - deadlines in the order of importance from the most important to the least important/not set are on top
      5 - the most recently added loans are on top
      */
      orderClause = `
        ORDER BY
          ${alias}.closed_at DESC NULLS FIRST,
          CASE WHEN DATE(${alias}.deadline) < CURRENT_DATE THEN 0 ELSE 1 END,
          DATE(${alias}.deadline) NULLS LAST,
          CASE
            WHEN ${alias}.priority = 'high' THEN 1
            WHEN ${alias}.priority = 'medium' THEN 2
            WHEN ${alias}.priority = 'low' THEN 3
            ELSE 4
          END,
          CASE WHEN ${alias}.deadline IS NULL THEN ${alias}.timestamp END DESC
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

router.patch("/:id/close", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.debug('Closing the loan', { uid, id });

    const { date, query: defaultQuery } = formDefaultSelectQuery(true, 3);

    const result = await db.query(
      `WITH changed AS (
          UPDATE loans
              SET closed_at = CURRENT_TIMESTAMP
              WHERE user_uid = $1 AND id = $2 AND closed_at IS NULL
              RETURNING *)
           ${defaultQuery};
      `,
      [uid, id, date]
    );

    if (result.rows.length === 0) {
      logger.warn('Requested loan has not been updated', { uid, id })
      return res.status(404).json({
        message: "Requested loan has not been found"
      })
    }

    logger.info('Requested loan has been retrieved successfully', {
      uid,
      loan_id: id
    });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    const { id } = req.params;
    logger.error(`Failed to close the loan`, {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      loan_id: id
    });
    res.status(500).json({ message: `Failed to close the loan` });
  }
})

router.get("/:id", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.debug('Fetching a loan', { uid, id });

    const { date, query: defaultQuery, alias } = formDefaultSelectQuery(false, 3);

    const result = await db.query(
      `${defaultQuery}
       WHERE ${alias}.user_uid = $1
         AND ${alias}.id = $2
       LIMIT 1;`,
      [uid, id, date]
    );

    if (result.rows.length === 0) {
      logger.warn('Requested loan has not been found', { uid, id })
      return res.status(404).json({
        message: "Requested loan has not been found"
      })
    }

    logger.info('Requested loan has been retrieved successfully', {
      uid,
      loan_id: id
    });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    const { id } = req.params;
    logger.error(`Failed to retrieve a loan`, {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      loan_id: id
    });
    res.status(500).json({ message: `Failed to retrieve the loan` });
  }
})

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