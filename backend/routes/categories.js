const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../logger')

router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;

    logger.debug('Fetching categories', { uid });

    const result = await db.query(
      "SELECT * FROM categories WHERE user_uid = $1;",
      [uid]
    );

    logger.info('Categories retrieved successfully', {
      uid,
      count: result.rows.length
    });

    return res.status(200).json({data: result.rows});
  } catch (error) {
    logger.error('Failed to retrieve categories', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid
    });
    res.status(500).json({ message: "Failed to retrieve categories" });
  }
})

router.post('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { color, name } = req.body;

    if (!color || !name) {
      logger.warn('Category creation attempted without required fields', {
        uid,
        hasColor: !!color,
        hasName: !!name
      });
      return res.status(400).json({ message: 'Color and name are required' });
    }

    logger.info('Creating new category', { uid, name });

    const result = await db.query(
      "INSERT INTO categories (color, name, user_uid) VALUES ($1, $2, $3) RETURNING id, color, name, created_at, updated_at;",
      [color, name, uid]
    )

    logger.info('Category created successfully', {
      uid,
      categoryId: result.rows[0].id,
      name
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to create category', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      color: req.body.color,
      name: req.body.name
    });
    res.status(500).json({ message: "Failed to create a category" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const { color, name } = req.body;

    if (!color && !name) {
      logger.warn('Category update attempted without any fields', { uid, categoryId: id });
      return res.status(400).json({ message: "No valid fields have been provided for update" });
    }

    logger.info('Updating category', { uid, categoryId: id });

    let fields = [], values = [], ind = 1;
    if (color) {
      fields.push(`color = $${ind++}`)
      values.push(color)
    }
    if (name) {
      fields.push(`name = $${ind++}`)
      values.push(name)
    }

    const query = `UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = $${ind} AND id = $${ind + 1} RETURNING id, color, name, created_at, updated_at;`
    const result = await db.query(query, [...values, uid, id]);

    if (result.rows.length === 0) {
      logger.warn('Category not found for update', { uid, categoryId: id });
      return res.status(404).json({ message: "Category has not been found" });
    }

    logger.info('Category updated successfully', {
      uid,
      categoryId: id,
      updatedFields: fields.length
    });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to update category', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      categoryId: req.params.id
    });
    res.status(500).json({ message: "Failed to update the category" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    logger.info('Attempting to delete category', { uid, categoryId: id });

    const result = await db.query(
      "DELETE FROM categories WHERE user_uid = $1 AND id = $2 RETURNING *;",
      [uid, id]
    );

    if (result.rows.length === 0) {
      logger.warn('Category not found for deletion', { uid, categoryId: id });
      return res.status(404).json({ message: "The category has not been found" });
    }

    logger.info('Category deleted successfully', { uid, categoryId: id });

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete category', {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      categoryId: req.params.id
    });
    res.status(500).json({ message: "Failed to delete the category" });
  }
});

module.exports = router;