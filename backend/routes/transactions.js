const express = require('express');
const db = require('../db');
const router = express.Router();
const logger = require('../logger')

const pageSize = 30;
const allowedFields = ["name", "price", "timestamp", "category_id"]
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const page = Number(req.query.page) || 1;

    if (page < 1) {
      logger.warn('Invalid page number requested', { uid, page });
      return res.status(400).json({ message: "Page must be greater than 0" });
    }

    logger.debug('Fetching transactions', { uid, page });

    const offset = (page - 1) * pageSize;
    const result = await db.query(
      `SELECT t.id,
              t.timestamp,
              t.created_at,
              t.updated_at,
              t.name,
              t.price,
              json_build_object(
                      'id', c.id,
                      'name', c.name,
                      'color', c.color
              ) as category
       FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_uid = $1
       ORDER BY t.timestamp DESC
       LIMIT $2 OFFSET $3;`,
      [uid, pageSize + 1, offset]
    );

    const isLastPage = result.rows.length <= pageSize;
    const transactions = result.rows.slice(0, pageSize);

    logger.info('Transactions retrieved successfully', {
      uid,
      page,
      count: transactions.length,
      isLastPage
    });

    return res.status(200).json({
      data: transactions,
      page: page,
      is_last_page: isLastPage
    });
  } catch (error) {
    logger.error('Failed to retrieve transactions', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      page: req.query.page
    });
    res.status(500).json({ message: "Failed to retrieve transactions" });
  }
})

router.post('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    let fields = [], values = [];

    if (!req.body["category_id"]) {
      logger.warn('Transaction creation attempted without category', { uid });
      return res.status(400).json({ message: `Category is mandatory` });
    }

    logger.debug('Validating category for transaction', {
      uid,
      categoryId: req.body.category_id
    });

    const catResult = await db.query(
      'SELECT id FROM categories WHERE id = $1 AND user_uid = $2',
      [req.body["category_id"], uid]
    );
    if (catResult.rows.length === 0) {
      logger.warn('Invalid category provided for transaction', {
        uid,
        categoryId: req.body.category_id
      });
      return res.status(400).json({ message: "Invalid category" });
    }

    for (const field of allowedFields) {
      if (!req.body[field]) {
        logger.warn('Transaction creation missing required field', {
          uid,
          missingField: field
        });
        return res.status(400).json({ message: `${field} is mandatory` });
      }

      fields.push(field)
      values.push(req.body[field]);
    }

    logger.info('Creating new transaction', {
      uid,
      name: req.body.name,
      price: req.body.price
    });

    const allFields = [...fields, "user_uid"];
    const allValues = [...values, uid];
    const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

    const result = await db.query(
      `WITH inserted AS (
          INSERT INTO transactions (${allFields.join(', ')})
              VALUES (${placeholders})
              RETURNING *)
       SELECT inserted.id,
              inserted.timestamp,
              inserted.created_at,
              inserted.updated_at,
              inserted.name,
              inserted.price,
              json_build_object(
                      'id', c.id,
                      'name', c.name,
                      'color', c.color
              ) AS category
       FROM inserted
                LEFT JOIN categories c ON inserted.category_id = c.id;
      `,
      allValues
    );

    logger.info('Transaction created successfully', {
      uid,
      transactionId: result.rows[0].id
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to create transaction', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      body: req.body
    });
    res.status(500).json({ message: "Failed to create a transaction" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    if (!req.body["category_id"]) {
      logger.warn('Transaction update attempted without category', {
        uid,
        transactionId: id
      });
      return res.status(400).json({ message: `Category is mandatory` });
    }

    logger.debug('Validating category for transaction update', {
      uid,
      transactionId: id,
      categoryId: req.body.category_id
    });

    const catResult = await db.query(
      'SELECT id FROM categories WHERE id = $1 AND user_uid = $2',
      [req.body["category_id"], uid]
    );
    if (catResult.rows.length === 0) {
      logger.warn('Invalid category provided for transaction update', {
        uid,
        transactionId: id,
        categoryId: req.body.category_id
      });
      return res.status(400).json({ message: "Invalid category" });
    }

    let fields = [], values = [], ind = 1;
    for (const field of allowedFields) {
      if (!req.body[field]) {
        logger.warn('Transaction update missing required field', {
          uid,
          transactionId: id,
          missingField: field
        });
        return res.status(400).json({ message: `${field} field is mandatory` });
      }

      fields.push(`${field} = $${ind++}`)
      values.push(req.body[field]);
    }

    logger.info('Updating transaction', { uid, transactionId: id });

    const query = `
        WITH updated AS (
            UPDATE transactions
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE user_uid = $${ind} AND id = $${ind + 1}
        RETURNING *)
        SELECT updated.id,
               updated.timestamp,
               updated.created_at,
               updated.updated_at,
               updated.name,
               updated.price,
               json_build_object(
                       'id', c.id,
                       'name', c.name,
                       'color', c.color
               ) AS category
        FROM updated
                 LEFT JOIN categories c ON updated.category_id = c.id;
    `;

    const result = await db.query(query, [...values, uid, id]);

    if (result.rows.length === 0) {
      logger.warn('Transaction not found for update', { uid, transactionId: id });
      return res.status(404).json({ message: "Transaction has not been found" });
    }

    logger.info('Transaction updated successfully', { uid, transactionId: id });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to update transaction', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      transactionId: req.params.id
    });
    res.status(500).json({ message: "Failed to update the transaction" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.info('Attempting to delete transaction', { uid, transactionId: id });

    const result = await db.query(
      "DELETE FROM transactions WHERE user_uid = $1 AND id = $2 RETURNING *;",
      [uid, id]
    );

    if (result.rows.length === 0) {
      logger.warn('Transaction not found for deletion', { uid, transactionId: id });
      return res.status(404).json({ message: "The transaction has not been found" });
    }

    logger.info('Transaction deleted successfully', { uid, transactionId: id });
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete transaction', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      transactionId: req.params.id
    });
    res.status(500).json({ message: "Failed to delete the transaction" });
  }
});

module.exports = router;