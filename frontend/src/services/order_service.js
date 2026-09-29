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

export const updateOrderStatus = (id, status, staffIdentifier = null) => {
  const payload = { status };
  if (typeof staffIdentifier === 'number') {
    payload.staff_id = staffIdentifier;
  } else if (staffIdentifier && typeof staffIdentifier === 'object') {
    if (staffIdentifier.id) payload.staff_id = staffIdentifier.id;
    if (staffIdentifier.nama) payload.staff_nama = staffIdentifier.nama;
  } else if (staffIdentifier) {
    if (!isNaN(staffIdentifier)) {
      payload.staff_id = Number(staffIdentifier);
    } else {
      payload.staff_nama = staffIdentifier;
    }
  }
  return request(API_ENDPOINTS.ORDER_STATUS(id), {
    method: 'PATCH',
    body: payload
  });
};

export const checkOrderPaymentStatus = (id) =>
  request(API_ENDPOINTS.ORDER_CHECK_PAYMENT(id));

export const updateOrderPayment = (id, paymentData) =>
  request(`${API_ENDPOINTS.ORDERS}/${id}/payment`, {
    method: 'PATCH',
    body: paymentData
  });

