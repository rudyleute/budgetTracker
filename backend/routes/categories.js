const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;

    const result = await db.query(
      "SELECT * FROM categories WHERE user_uid = $1;",
      [uid]
    );

    return res.status(200).json({data: result.rows});
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve categories" });
  }
})

router.post('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { color, name } = req.body;

    const result = await db.query(
      "INSERT INTO categories (color, name, user_uid) VALUES ($1, $2, $3) RETURNING *;",
      [color, name, uid]
    )

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to create a category" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const { color, name } = req.body;

    if (!color && !name) {
      return res.status(400).json({ message: "No valid fields have been provided for update" });
    }

    let fields = [], values = [], ind = 1;
    if (color) {
      fields.push(`color = $${ind++}`)
      values.push(color)
    }
    if (name) {
      fields.push(`name = $${ind++}`)
      values.push(name)
    }

    const query = `UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = $${ind} AND id = $${ind + 1} RETURNING *;`
    const result = await db.query(query, [...values, uid, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category has not been found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update the category" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM categories WHERE user_uid = $1 AND id = $2 RETURNING *;",
      [uid, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "The category has not been found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the category" });
  }
});

module.exports = router;