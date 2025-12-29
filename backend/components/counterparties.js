const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../logger');
const { handleDelete, handleUpsert } = require('./generic');
const { buildPostQuery, buildPatchQuery } = require('../helpers/counterparties.query');

const pageSize = 30;
const reqAllowedFields = ["name"]
const optAllowedFields = ["email", "phone", "note"]
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { filter, offset, limit } = req.query;

    const includeBalance = req.query.balance === 'true';

    logger.debug('Fetching counterparties', { uid, includeBalance, offset, limit });

    let params = [], cond = []

    if (filter) {
      params.push(`%${filter}%`);
      cond.push(`LOWER(cp.name) LIKE LOWER($${params.length})`);
    }
    params.push(uid);
    cond.push(`cp.user_uid = $${params.length}`)

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

    let query;
    if (includeBalance) {
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

    let counterparties, isLastPage;

    if (includeLimit) {
      isLastPage = result.rows.length <= effectiveLimit;
      counterparties = result.rows.slice(0, effectiveLimit);
    } else {
      isLastPage = true;
      counterparties = result.rows;
    }

    logger.info('Counterparties retrieved successfully', {
      uid,
      count: counterparties.length,
      isLastPage
    });

    return res.status(200).json({
      data: counterparties,
      is_last_page: isLastPage
    });
  } catch (error) {
    logger.error('Failed to retrieve counterparties', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to retrieve counterparties" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.debug('Fetching counterparties', { uid });

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
        LIMIT 1;`

    const result = await db.query(query, [uid, id]);

    if (result.rows.length === 0) {
      logger.warn('Requested counterparty has not been found', { uid, id })
      return res.status(404).json({
        message: "Requested counterparty has not been found"
      })
    }

    logger.info('Requested counterparty has been retrieved successfully', {
      uid,
      loan_id: id
    });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to retrieve counterparty', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to retrieve counterparty" });
  }
});

router.post('/', (req, res) => handleUpsert({
  req,
  res,
  entityName: 'counterparty',
  reqAllowedFields,
  optAllowedFields,
  buildQuery: buildPostQuery
}, db, logger));

router.patch('/:id', (req, res) => handleUpsert({
  req,
  res,
  entityName: 'counterparty',
  reqAllowedFields,
  optAllowedFields,
  buildQuery: buildPatchQuery
}, db, logger));

router.delete('/:id', (req, res) =>
  handleDelete({
    table: 'counterparties',
    idField: 'id',
    entityName: 'counterparty',
    req,
    res
  }, db, logger)
);

module.exports = router;
