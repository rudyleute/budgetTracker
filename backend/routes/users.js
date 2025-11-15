const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require('../firebase');

router.post('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { email } = req.body;

    const result = await db.query(
      "INSERT INTO users (uid, email) VALUES ($1, $2) RETURNING *;",
      [uid, email]
    )

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to create a user" });
  }
});

router.put('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "No valid fields have been provided for update" });
    }

    const result = await db.query(
      "UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE uid = $2 RETURNING *;",
      [email, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User has not been found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update a user" });
  }
});

router.delete('/', async (req, res) => {
  const client = await db.getClient();

  try {
    const uid = req.user.uid;
    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM users WHERE uid = $1 RETURNING *;',
      [uid]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "User has not been found" });
    }

    await admin.auth().deleteUser(uid);

    await client.query('COMMIT');
    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Failed to delete user" });
  } finally {
    client.release();
  }
});

module.exports = router;