import { request } from './api_client';
import { API_ENDPOINTS } from '../config/api_config';

export const getStockLogs = (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_ENDPOINTS.STOCK_LOGS}${query ? `?${query}` : ''}`, options);
};

export const addStockEntry = (payload) =>
  request(API_ENDPOINTS.STOCK_LOGS, {
    method: 'POST',
    body: payload
  });

