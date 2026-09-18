const express = require('express');
const dashboardController = require('./dashboard_controller');

const router = express.Router();

router.get('/stats', (req, res) => dashboardController.getStats(req, res));

module.exports = router;
