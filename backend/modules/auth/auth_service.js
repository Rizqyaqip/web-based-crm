const authRepository = require('./auth_repository');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
} = require('../../utils');
const { userRoles, USER_ROLES } = require('../../constants');

class AuthService {
  async authenticate({ nama, password } = {}) {
    if (!nama || !password) {
      throw new BadRequestError('Username dan kata sandi wajib diisi');
    }

    const user = await authRepository.findByName(nama);
    if (!user || user.password !== password) {
      throw new UnauthorizedError('Username atau kata sandi tidak valid');
    }

    const adminRole = (userRoles && userRoles.admin) || USER_ROLES.ADMIN || 'admin';
    const staffRole = (userRoles && userRoles.staff) || USER_ROLES.STAFF || 'staff';

    if (user.role !== adminRole && user.role !== staffRole) {
      throw new ForbiddenError('Akun ini tidak memiliki hak akses portal staf/admin');
    }

    return {
      id: user.id,
      nama: user.nama,
      role: user.role
    };
  }

  async getAllUsers(filters) {
    return await authRepository.findAllUsers(filters);
  }

  async getUserById(id) {
    const user = await authRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`Pengguna dengan ID ${id} tidak ditemukan`);
    }
    return user;
  }

  async createUser({ nama, password, role } = {}) {
    if (!nama || !password) {
      throw new BadRequestError('Nama dan password wajib diisi');
    }

    const defaultRole = (userRoles && userRoles.staff) || USER_ROLES.STAFF || 'staff';
    const validRole = role || defaultRole;
    return await authRepository.createUser({ nama, password, role: validRole });
  }

  async updateUser(id, data = {}) {
    await this.getUserById(id); // Memastikan ada
    const updated = await authRepository.updateUser(id, data);
    if (!updated) {
      throw new BadRequestError('Tidak ada data yang diperbarui');
    }
    return updated;
  }

  async deleteUser(id) {
    await this.getUserById(id); // Memastikan ada
    await authRepository.deleteUserById(id);
    return { id, deleted: true };
  }

}

module.exports = new AuthService();

