const authService = require('./auth_service');
const { sendSuccess } = require('../../utils');
const { httpStatusCodes, HTTP_STATUS } = require('../../constants');

class AuthController {
  async login(req, res) {
    const user = await authService.authenticate(req.body);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Login berhasil', user);
  }

  async getUsers(req, res) {
    const { search, limit } = req.query;
    const users = await authService.getAllUsers({ search, limit });
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Daftar pengguna berhasil diambil', users, {
      total: users.length
    });
  }

  async getUserById(req, res) {
    const { id } = req.params;
    const user = await authService.getUserById(id);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Detail pengguna berhasil diambil', user);
  }

  async createUser(req, res) {
    const user = await authService.createUser(req.body);
    const status = (httpStatusCodes && httpStatusCodes.created) || HTTP_STATUS.CREATED || 201;
    return sendSuccess(res, status, 'Pengguna baru berhasil ditambahkan', user);
  }

  async updateUser(req, res) {
    const { id } = req.params;
    const updated = await authService.updateUser(id, req.body);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, 'Data pengguna berhasil diperbarui', updated);
  }

  async deleteUser(req, res) {
    const { id } = req.params;
    const result = await authService.deleteUser(id);
    const status = (httpStatusCodes && httpStatusCodes.ok) || HTTP_STATUS.OK || 200;
    return sendSuccess(res, status, `Pengguna dengan ID ${id} berhasil dihapus`, result);
  }
}

module.exports = new AuthController();
