const { pool } = require('../../database');

class AuthRepository {
  async findByName(nama) {
    const [rows] = await pool.query(
      'SELECT id, nama, password, role FROM users WHERE nama = ? LIMIT 1',
      [String(nama).trim()]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nama, role FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findAllUsers({ search, limit = 50 } = {}) {
    const maxLimit = Math.min(Number(limit) || 50, 100);
    let sql = 'SELECT id, nama, role FROM users';
    const params = [];

    if (search) {
      sql += ' WHERE nama LIKE ? OR role LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(maxLimit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createUser({ nama, password, role = 'staff' } = {}) {
    const [result] = await pool.query(
      'INSERT INTO users (nama, password, role) VALUES (?, ?, ?)',
      [String(nama).trim(), password, role]
    );

    return {
      id: result.insertId,
      nama: String(nama).trim(),
      role
    };
  }

  async updateUser(id, fields = {}) {
    const updates = [];
    const params = [];

    if (fields.nama !== undefined) {
      updates.push('nama = ?');
      params.push(String(fields.nama).trim());
    }
    if (fields.password !== undefined && fields.password !== '') {
      updates.push('password = ?');
      params.push(fields.password);
    }
    if (fields.role !== undefined) {
      updates.push('role = ?');
      params.push(fields.role);
    }

    if (updates.length === 0) return null;

    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    return await this.findById(id);
  }

  async deleteUserById(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

}

module.exports = new AuthRepository();

