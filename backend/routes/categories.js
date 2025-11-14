const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({res: `get`});
})

router.post('/', (req, res) => {
  res.json({body: req.body});
})

router.put('/:uuid', (req, res) => {
  res.json({uuid: `put ${req.params.uuid}`, user: req.body});
})

router.delete('/:uuid', (req, res) => {
  res.json({uuid: `delete ${req.params.uuid}`});
})

module.exports = router;