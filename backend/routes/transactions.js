const express = require('express');
const db = require('../db');
const router = express.Router();

const pageSize = 2;
const allowedFields = ["name", "price", "timestamp", "category_id"]
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const page = Number(req.query.page) || 1;

    if (page < 1) return res.status(400).json({ message: "Page must be greater than 0" });

    const offset = (page - 1) * pageSize;
    const result = await db.query(
      `SELECT 
        t.id, t.timestamp, t.created_at, t.updated_at, t.name, t.price, t.user_uid,
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

    return res.status(200).json({
      data: transactions,
      page: page,
      isLastPage,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve transactions" });
  }
})

router.post('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    let fields = [], values = [];

    if (!req.body["category_id"]) return res.status(400).json({ message: `Category is mandatory` });

    const catResult = await db.query(
      'SELECT id FROM categories WHERE id = $1 AND user_uid = $2',
      [req.body["category_id"], uid]
    );
    if (catResult.rows.length === 0) return res.status(400).json({ message: "Invalid category" });

    for (const field of allowedFields) {
      if (!req.body[field]) return res.status(400).json({ message: `${field} is mandatory` });

      fields.push(field)
      values.push(req.body[field]);
    }

    const allFields = [...fields, "user_uid"];
    const allValues = [...values, uid];
    const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

    const result = await db.query(
      `INSERT INTO transactions (${allFields.join(', ')}) VALUES (${placeholders}) RETURNING *;`,
      allValues
    )

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to create a transaction" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    if (!req.body["category_id"]) return res.status(400).json({ message: `Category is mandatory` });

    const catResult = await db.query(
      'SELECT id FROM categories WHERE id = $1 AND user_uid = $2',
      [req.body["category_id"], uid]
    );
    if (catResult.rows.length === 0) return res.status(400).json({ message: "Invalid category" });

    let fields = [], values = [], ind = 1;
    for (const field of allowedFields) {
      if (!req.body[field]) return res.status(400).json({ message: `${field} field is mandatory` });

      fields.push(`${field} = $${ind++}`)
      values.push(req.body[field]);
    }

    const query = `UPDATE transactions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = $${ind} AND id = $${ind + 1} RETURNING *;`
    const result = await db.query(query, [...values, uid, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaction has not been found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update the transaction" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM transactions WHERE user_uid = $1 AND id = $2 RETURNING *;",
      [uid, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "The transaction has not been found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the transaction" });
  }
});

module.exports = router;