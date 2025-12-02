const express = require('express');
const db = require('../db');
const router = express.Router();
const logger = require('../logger')
const handleUpsert = require('../helpers/validator');

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
    const { type: reqType, priority, sort, order = "DESC", from, to, offset, due } = req.query;

    logger.debug('Fetching loans', { uid, offset, reqType, priority, sort, order, from, to, due });
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

    params.push(pageSize + 1);
    params.push(Number(offset ?? 0));

    query += `\n
      ${orderClause}
      LIMIT $${params.length - 1}
      OFFSET $${params.length};
    `;

    const result = await db.query(query, params);
    const isLastPage = result.rows.length <= pageSize;
    const loans = result.rows.slice(0, pageSize);

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
  additionalValidation: validateLoanCounterparty,
  buildQuery: buildLoanQuery
}, db, logger));

router.put('/:id', (req, res) => handleUpsert({
  req,
  res,
  entityName: 'loan',
  reqAllowedFields,
  optAllowedFields,
  additionalValidation: validateLoanCounterparty,
  buildQuery: buildLoanQuery
}, db, logger));

function buildLoanQuery({ fields, values, uid, id, isUpdate }) {
  if (isUpdate) {
    let idx = 1;
    const setClauses = fields.map(f => `${f} = $${idx++}`);

    const uidPlaceholder = `$${idx++}`;
    const idPlaceholder = `$${idx}`;

    const query = `
      WITH updated AS (
        UPDATE loans
        SET ${setClauses.join(', ')}
        WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
        RETURNING *
      )
      SELECT updated.id,
             updated.name,
             updated.timestamp,
             updated.deadline,
             updated.priority,
             updated.type,
             updated.price,
             json_build_object(
               'id', cp.id,
               'name', cp.name,
               'email', cp.email,
               'note', cp.note,
               'phone', cp.phone
             ) AS counterparty
      FROM updated
      LEFT JOIN counterparties cp ON updated.counterparty_id = cp.id;
    `;

    return { query, queryValues: [...values, uid, id] };
  } else {
    const allFields = [...fields, "user_uid"];
    const allValues = [...values, uid];
    const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      WITH inserted AS (
        INSERT INTO loans (${allFields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      )
      SELECT inserted.id,
             inserted.name,
             inserted.timestamp,
             inserted.deadline,
             inserted.priority,
             inserted.type,
             inserted.price,
             json_build_object(
               'id', cp.id,
               'name', cp.name,
               'email', cp.email,
               'note', cp.note,
               'phone', cp.phone
             ) AS counterparty
      FROM inserted
      LEFT JOIN counterparties cp ON inserted.counterparty_id = cp.id;
    `;

    return { query, queryValues: allValues };
  }
}

async function validateLoanCounterparty(db, req, uid) {
  if (!req.body["counterparty_id"]) {
    return {
      message: "Counterparty is mandatory",
      context: {}
    };
  }

  const cpResult = await db.query(
    'SELECT id FROM counterparties WHERE id = $1 AND user_uid = $2',
    [req.body["counterparty_id"], uid]
  );

  if (cpResult.rows.length === 0) {
    return {
      message: "Invalid counterparty",
      context: { counterpartyId: req.body.counterparty_id }
    };
  }

  return null;
}

router.delete('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.info('Attempting to delete loan', { uid, loanId: id });

    const result = await db.query(
      "DELETE FROM loans WHERE user_uid = $1 AND id = $2 RETURNING *;",
      [uid, id]
    );

    if (result.rows.length === 0) {
      logger.warn('Loan not found for deletion', { uid, loanId: id });
      return res.status(404).json({ message: "Loan not found" });
    }

    logger.info('Loan deleted successfully', { uid, loanId: id });
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete loan', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      loanId: req.params.id
    });
    res.status(500).json({ message: "Failed to delete loan" });
  }
});

module.exports = router;