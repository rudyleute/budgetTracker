const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../logger');
const { log } = require('winston');
const handleUpsert = require('../helpers/validator');

const reqAllowedFields = ["name"]
const optAllowedFields = ["email"]
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;

    logger.debug('Fetching counterparties', { uid });
    const result = await db.query(
      "SELECT id, name, email FROM counterparties WHERE user_uid = $1 ORDER BY name;",
      [uid]
    );

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
  buildQuery: buildCounterpartyQuery
}, db, logger));

router.put('/:id', (req, res) => handleUpsert({
  req,
  res,
  entityName: 'counterparty',
  reqAllowedFields,
  optAllowedFields,
  buildQuery: buildCounterpartyQuery
}, db, logger));

function buildCounterpartyQuery({ fields, values, uid, id, isUpdate }) {
  if (isUpdate) {
    let idx = 1;
    const setClauses = fields.map(f => `${f} = $${idx++}`);

    const query = `
      UPDATE counterparties
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE user_uid = $${idx} AND id = $${idx + 1}
      RETURNING id, name, email;
    `;

    return { query, queryValues: [...values, uid, id] };
  } else {
    const allFields = [...fields, "user_uid"];
    const allValues = [...values, uid];
    const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO counterparties (${allFields.join(", ")})
      VALUES (${placeholders})
      RETURNING id, name, email
    `;

    return { query, queryValues: allValues };
  }
}

router.delete('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.info('Attempting to delete counterparty', { uid, counterpartyId: id });

    const result = await db.query(
      "DELETE FROM counterparties WHERE user_uid = $1 AND id = $2 RETURNING *;",
      [uid, id]
    );

    if (result.rows.length === 0) {
      logger.warn('Counterparty not found for deletion', { uid, counterpartyId: id });
      return res.status(404).json({ message: "The counterparty has not been found" });
    }

    logger.info('Counterparty deleted successfully', { uid, counterpartyId: id });

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete counterparty', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      counterpartyId: req.params.id
    });
    res.status(500).json({ message: "Failed to delete the counterparty" });
  }
});

module.exports = router;
