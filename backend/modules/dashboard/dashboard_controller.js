const dashboardService = require('./dashboard_service');
const { sendSuccess } = require('../../utils');
const { httpStatusCodes, HTTP_STATUS } = require('../../constants');

class DashboardController {
  async getStats(req, res) {
    const metrics = await dashboardService.getDashboardMetrics();
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Statistik dashboard berhasil diambil', metrics);
  }
}

module.exports = new DashboardController();
