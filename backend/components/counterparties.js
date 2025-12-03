const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../logger');
const { handleDelete, handleUpsert } = require('./generic');
const { buildPostQuery, buildPatchQuery } = require('../helpers/counterparties.query');

const reqAllowedFields = ["name"]
const optAllowedFields = ["email", "phone", "note"]
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;

    const includeBalance = req.query.balance === 'true';
    logger.debug('Fetching counterparties', { uid, includeBalance });

    let query;
    if (includeBalance) {
      query = `
          SELECT
              cp.id,
              cp.name,
              cp.email,
              cp.phone,
              cp.note,
              COALESCE(
                SUM(CASE WHEN l.type = 'borrowed' THEN l.price ELSE 0 END) -
                SUM(CASE WHEN l.type = 'lent' THEN l.price ELSE 0 END),
                0
              ) AS balance
          FROM counterparties cp
                   LEFT JOIN loans l ON cp.id = l.counterparty_id AND l.user_uid = $1
          WHERE cp.user_uid = $1
          GROUP BY cp.id
          ORDER BY balance DESC;
      `;
    } else {
      query = `
        SELECT id, name, email, note, phone
        FROM counterparties 
        WHERE user_uid = $1 
        ORDER BY name;
      `;
    }

    const result = await db.query(query, [uid]);

    logger.info('Counterparties retrieved successfully', { uid, count: result.rows.length });
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    logger.error('Failed to retrieve counterparties', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to retrieve counterparties" });
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
    res,
  }, db, logger)
);

module.exports = router;
