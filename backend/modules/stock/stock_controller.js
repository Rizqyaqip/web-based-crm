const stockService = require('./stock_service');
const { sendSuccess } = require('../../utils');
const { httpStatusCodes, HTTP_STATUS } = require('../../constants');

class StockController {
  async getLogs(req, res) {
    const { startDate, endDate, productId, limit } = req.query;
    const logs = await stockService.getStockLogs({ startDate, endDate, productId, limit });
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Riwayat mutasi stok berhasil diambil', logs, {
      total: logs.length
    });
  }

  async addEntry(req, res) {
    const result = await stockService.addStockEntry(req.body);
    const status = (httpStatusCodes && httpStatusCodes.created) || HTTP_STATUS.CREATED || 201;
    return sendSuccess(
      res,
      status,
      `Berhasil menambahkan ${result.jumlah_ditambahkan || result.jumlahDitambahkan} unit stok untuk ${result.nama_produk || result.namaProduk}`,
      result
    );
  }
}

module.exports = new StockController();
