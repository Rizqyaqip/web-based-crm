const orderService = require('./order_service');
const { sendSuccess } = require('../../utils');
const { httpStatusCodes, HTTP_STATUS } = require('../../constants');

class OrderController {
  async create(req, res) {
    const orderData = await orderService.processCheckout(req.body);
    const status = (httpStatusCodes && httpStatusCodes.created) || HTTP_STATUS.CREATED || 201;
    return sendSuccess(res, status, 'Pesanan berhasil dibuat', orderData);
  }

  async getAll(req, res) {
    const { status: orderState, search, limit, startDate, endDate } = req.query;
    const orders = await orderService.getAllOrders({ status: orderState, search, limit, startDate, endDate });
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Daftar pesanan berhasil diambil', orders, {
      total: orders.length
    });
  }

  async getById(req, res) {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Detail pesanan berhasil diambil', order);
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status: orderState, staff_id, staffId, staff_nama, staffNama } = req.body;
    let finalStaffId = staff_id || staffId || req.user?.id || null;

    if (!finalStaffId && (staff_nama || staffNama)) {
      finalStaffId = await orderService.findUserIdByName(staff_nama || staffNama);
    }

    const result = await orderService.updateStatus(id, orderState, finalStaffId);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, `Status pesanan #${id} berhasil diubah menjadi ${orderState}`, result);
  }

  async checkPayment(req, res) {
    const { id } = req.params;
    const order = await orderService.checkOrderPaymentStatus(id);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Status pembayaran pesanan berhasil diverifikasi', order);
  }

  async updatePayment(req, res) {
    const { id } = req.params;
    const { metode, status, payment_type } = req.body;
    const result = await orderService.updatePaymentDetails(id, { metode, status, paymentType: payment_type });
    const statusCode = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, statusCode, 'Detail pembayaran berhasil diperbarui', result);
  }

  async handleMidtransWebhook(req, res) {
    const result = await orderService.processMidtransWebhook(req.body);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Notifikasi Midtrans berhasil diproses', result);
  }
}

module.exports = new OrderController();
