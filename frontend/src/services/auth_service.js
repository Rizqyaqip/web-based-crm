import { request } from './api_client';
import { API_ENDPOINTS } from '../config/api_config';

export const loginUser = (nama, password) =>
  request(API_ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: { nama, password }
  });

export const getStaffList = (options = {}) => request(API_ENDPOINTS.AUTH_USERS, options);

export const createStaff = (userData) =>
  request(API_ENDPOINTS.AUTH_USERS, {
    method: 'POST',
    body: userData
  });

export const updateStaff = (id, userData) =>
  request(`${API_ENDPOINTS.AUTH_USERS}/${id}`, {
    method: 'PUT',
    body: userData
  });

export const deleteStaff = (id) =>
  request(`${API_ENDPOINTS.AUTH_USERS}/${id}`, {
    method: 'DELETE'
  });

export const getDashboardStats = (options = {}) => request(API_ENDPOINTS.DASHBOARD_STATS, options);

