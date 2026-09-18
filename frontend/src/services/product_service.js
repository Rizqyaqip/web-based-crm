import { request } from './api_client';
import { API_ENDPOINTS } from '../config/api_config';

export const getProducts = (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_ENDPOINTS.PRODUCTS}${query ? `?${query}` : ''}`, options);
};

export const getProductById = (id, options = {}) => request(`${API_ENDPOINTS.PRODUCTS}/${id}`, options);

export const getBestSellers = (limit = 6, options = {}) =>
  request(`${API_ENDPOINTS.PRODUCT_BEST_SELLERS}?limit=${limit}`, options);

export const getProductCategories = (options = {}) => request(API_ENDPOINTS.PRODUCT_CATEGORIES, options);

export const createProduct = (productData) =>
  request(API_ENDPOINTS.PRODUCTS, {
    method: 'POST',
    body: productData
  });

export const updateProduct = (id, productData) =>
  request(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'PUT',
    body: productData
  });

export const uploadProductImage = (file, category, productName) => {
  const formData = new FormData();
  // PENTING: Append kategori dan nama_produk SEBELUM image agar stream multipart multer langsung membaca field
  if (category) {
    formData.append('kategori', category);
  }
  if (productName) {
    formData.append('nama_produk', productName);
  }
  formData.append('image', file);

  const params = new URLSearchParams();
  if (category) params.append('kategori', category);
  if (productName) params.append('nama_produk', productName);
  const queryString = params.toString() ? `?${params.toString()}` : '';

  return request(`${API_ENDPOINTS.PRODUCTS}/upload-image${queryString}`, {
    method: 'POST',
    body: formData
  });
};

export const deleteProduct = (id) =>
  request(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'DELETE'
  });

export const ensureCategoryDirectory = (category) =>
  request(`${API_ENDPOINTS.PRODUCTS}/categories/ensure-dir`, {
    method: 'POST',
    body: { kategori: category }
  });



