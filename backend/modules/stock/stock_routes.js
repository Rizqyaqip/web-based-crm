const express = require('express');
const stockController = require('./stock_controller');

const router = express.Router();

router.get('/', (req, res) => stockController.getLogs(req, res));
router.post('/', (req, res) => stockController.addEntry(req, res));

module.exports = router;
