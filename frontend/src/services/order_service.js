import { request } from './api_client';
import { API_ENDPOINTS } from '../config/api_config';

export const createOrder = (orderData) =>
  request(API_ENDPOINTS.ORDERS, {
    method: 'POST',
    body: orderData
  });

export const getOrders = (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_ENDPOINTS.ORDERS}${query ? `?${query}` : ''}`, options);
};

export const getOrderById = (id, options = {}) => request(`${API_ENDPOINTS.ORDERS}/${id}`, options);

export const updateOrderStatus = (id, status) =>
  request(API_ENDPOINTS.ORDER_STATUS(id), {
    method: 'PATCH',
    body: { status }
  });

export const updateOrderPayment = (id, paymentData) =>
  request(`${API_ENDPOINTS.ORDERS}/${id}/payment`, {
    method: 'PATCH',
    body: paymentData
  });

