const productRepository = require('./product_repository');
const { NotFoundError, BadRequestError } = require('../../utils');

class ProductService {
  async getAllProducts(filters) {
    return await productRepository.findAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Produk dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  async getBestSellers(limit) {
    return await productRepository.findBestSellers(limit);
  }

  async getCategories() {
    return await productRepository.findCategories();
  }

  async createProduct(data = {}) {
    const namaProduk = data.nama_produk || data.namaProduk;
    const harga = data.harga;

    if (!namaProduk || harga === undefined || isNaN(Number(harga)) || Number(harga) < 0) {
      throw new BadRequestError('nama_produk dan harga valid wajib diisi');
    }
    return await productRepository.create(data);
  }

  async updateProduct(id, data = {}) {
    await this.getProductById(id); // Memastikan ada
    const updated = await productRepository.update(id, data);
    if (!updated) {
      throw new BadRequestError('Tidak ada kolom yang diubah');
    }
    return updated;
  }

  async deleteProduct(id) {
    await this.getProductById(id); // Memastikan ada
    await productRepository.deleteById(id);
    return { id, deleted: true };
  }
}

module.exports = new ProductService();

