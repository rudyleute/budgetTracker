const express = require('express');
const router = express.Router();

router.get('/:userUid', (req, res) => {
  res.json({userUid: `get ${req.params.userUid}`});
})

router.post('/', (req, res) => {
  res.json({body: req.body});
})

router.put('/:userUid', (req, res) => {
  res.json({userUid: `put ${req.params.userUid}`, user: req.body});
})

router.delete('/:userUid', (req, res) => {
  res.json({userUid: `delete ${req.params.userUid}`});
})

module.exports = router;