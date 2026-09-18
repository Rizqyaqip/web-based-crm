const { pool } = require('../../database');

class ProductRepository {
  async findAll({ search, kategori, limit = 50 } = {}) {
    const maxLimit = Math.min(Number(limit) || 50, 100);
    let sql = 'SELECT id, nama_produk, deskripsi, kategori, gambar, harga, jumlahStok FROM products';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(nama_produk LIKE ? OR kategori LIKE ? OR deskripsi LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (kategori && kategori !== 'Semua') {
      conditions.push('LOWER(kategori) = LOWER(?)');
      params.push(kategori);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id ASC LIMIT ?';
    params.push(maxLimit);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nama_produk, deskripsi, kategori, gambar, harga, jumlahStok FROM products WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findBestSellers(limit = 6) {
    const maxLimit = Math.min(Number(limit) || 6, 12);
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nama_produk,
        p.deskripsi,
        p.kategori,
        p.gambar,
        p.harga,
        p.jumlahStok,
        COALESCE(SUM(oi.jumlah), 0) AS total_terjual
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.nama_produk, p.deskripsi, p.kategori, p.gambar, p.harga, p.jumlahStok
      ORDER BY total_terjual DESC, p.id ASC
      LIMIT ?
    `, [maxLimit]);

    return rows.map((r) => ({
      ...r,
      total_terjual: Number(r.total_terjual)
    }));
  }

  async findCategories() {
    const [rows] = await pool.query(`
      SELECT DISTINCT kategori 
      FROM products 
      WHERE kategori IS NOT NULL AND kategori != ''
      ORDER BY 
        CASE 
          WHEN LOWER(kategori) LIKE 'ketsai%' THEN 1
          WHEN LOWER(kategori) LIKE 'frozen%' THEN 2
          WHEN LOWER(kategori) LIKE 'ice%' THEN 3
          ELSE 4
        END,
        kategori ASC
    `);

    return ['Semua', ...rows.map((r) => r.kategori)];
  }

  async create({ nama_produk, namaProduk, deskripsi, kategori, gambar, harga, jumlahStok } = {}) {
    const finalNama = (nama_produk || namaProduk || '').trim();
    const finalDeskripsi = deskripsi || null;

    const [result] = await pool.query(
      'INSERT INTO products (nama_produk, deskripsi, kategori, gambar, harga, jumlahStok) VALUES (?, ?, ?, ?, ?, ?)',
      [
        finalNama,
        finalDeskripsi,
        kategori || 'Umum',
        gambar || null,
        Number(harga) || 0,
        Number(jumlahStok) || 0
      ]
    );

    return {
      id: result.insertId,
      nama_produk: finalNama,
      deskripsi: finalDeskripsi,
      kategori: kategori || 'Umum',
      gambar: gambar || null,
      harga: Number(harga) || 0,
      jumlahStok: Number(jumlahStok) || 0
    };
  }

  async update(id, fields = {}) {
    const updates = [];
    const params = [];

    const nama = fields.nama_produk !== undefined ? fields.nama_produk : fields.namaProduk;
    if (nama !== undefined) {
      updates.push('nama_produk = ?');
      params.push(String(nama).trim());
    }
    if (fields.deskripsi !== undefined) {
      updates.push('deskripsi = ?');
      params.push(fields.deskripsi);
    }
    if (fields.kategori !== undefined) {
      updates.push('kategori = ?');
      params.push(fields.kategori);
    }
    if (fields.gambar !== undefined) {
      updates.push('gambar = ?');
      params.push(fields.gambar);
    }
    if (fields.harga !== undefined) {
      updates.push('harga = ?');
      params.push(Number(fields.harga));
    }
    if (fields.jumlahStok !== undefined) {
      updates.push('jumlahStok = ?');
      params.push(Number(fields.jumlahStok));
    }

    if (updates.length === 0) return null;

    params.push(id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    return await this.findById(id);
  }

  async deleteById(id) {
    try {
      await pool.query('DELETE FROM stock_logs WHERE product_id = ?', [id]);
    } catch (e) {
      // Abaikan jika tabel/relasi tidak ada
    }
    try {
      await pool.query('DELETE FROM order_items WHERE product_id = ?', [id]);
    } catch (e) {
      // Abaikan jika tabel/relasi tidak ada
    }
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

}

module.exports = new ProductRepository();

