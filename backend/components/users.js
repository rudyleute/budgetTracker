const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require('../firebase');
const logger = require('../logger');

router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;

    logger.debug('Fetching a user', { uid });

    const result = await db.query(
      'SELECT uid, email, created_at, updated_at FROM users WHERE uid = $1;',
      [uid]
    );

    if (result.rows.length === 0) {
      logger.warn('User has not been found', { uid });
      return res.status(404).json({ message: 'User has not been found' });
    }

    logger.info('User retrieved successfully', { uid });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to fetch the user', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: 'Failed to retrieve the user' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { uid, email } = req.user;

    logger.info("Creating new user", { uid, email });

    const result = await db.query(
      "INSERT INTO users (uid, email) VALUES ($1, $2) RETURNING *;",
      [uid, email]
    )

    logger.info('User created successfully', { uid });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to create user', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to create a user" });
  }
});

router.patch('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "No valid fields have been provided for update" });

    logger.info('Updating user email', { uid });

    const result = await db.query(
      "UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE uid = $2 RETURNING *;",
      [email, uid]
    );

    if (result.rows.length === 0) {
      logger.warn('User not found for update', { uid });
      return res.status(404).json({ message: "User has not been found" });
    }

    logger.info('User updated successfully', { uid });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to update user', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to update a user" });
  }
});

router.delete('/', async (req, res) => {
  const client = await db.getClient();

  try {
    const uid = req.user.uid;

    logger.info('Attempting to delete user', { uid });

    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM users WHERE uid = $1 RETURNING *;',
      [uid]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      logger.warn('User not found for deletion', { uid });
      return res.status(404).json({ message: "User has not been found" });
    }

    await admin.auth().deleteUser(uid);
    await client.query('COMMIT');

    logger.info('User deleted successfully', { uid });
    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to delete user', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to delete user" });
  } finally {
    client.release();
  }
});

module.exports = router;