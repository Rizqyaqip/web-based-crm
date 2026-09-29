const express = require('express');
const orderController = require('./order_controller');

const router = express.Router();

router.post('/', (req, res) => orderController.create(req, res));
router.get('/', (req, res) => orderController.getAll(req, res));
router.get('/:id', (req, res) => orderController.getById(req, res));
router.get('/:id/check-payment', (req, res) => orderController.checkPayment(req, res));
router.patch('/:id/status', (req, res) => orderController.updateStatus(req, res));
router.patch('/:id/payment', (req, res) => orderController.updatePayment(req, res));
router.post('/webhook/midtrans', (req, res) => orderController.handleMidtransWebhook(req, res));
router.post('/notification/midtrans', (req, res) => orderController.handleMidtransWebhook(req, res));

module.exports = router;
