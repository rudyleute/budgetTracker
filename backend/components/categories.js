const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../logger')
const { handleUpsert, handleDelete } = require('./generic');
const { buildPostQuery, buildPatchQuery } = require('../helpers/categories.query');

const reqAllowedFields = ["name", "color"];

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

router.post('/', (req, res) =>
  handleUpsert({
    req,
    res,
    entityName: "category",
    reqAllowedFields,
    optAllowedFields: [],
    buildQuery: buildPostQuery
  }, db, logger)
);

router.patch('/:id', (req, res) =>
  handleUpsert({
    req,
    res,
    entityName: "category",
    reqAllowedFields,
    optAllowedFields: [],
    buildQuery: buildPatchQuery
  }, db, logger)
);

router.delete('/:id', (req, res) =>
  handleDelete({
    table: 'categories',
    idField: 'id',
    entityName: 'category',
    req,
    res
  }, db, logger)
);

module.exports = router;