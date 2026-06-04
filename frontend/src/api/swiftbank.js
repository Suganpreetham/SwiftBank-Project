import axios from 'axios';

const BASE_URL = 'http://localhost:8090';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);

// Accounts
export const getAccounts = () => api.get('/api/accounts');
export const createAccount = (type) => api.post('/api/accounts', { type });
export const getBalance = (accountId) => api.get(`/api/accounts/${accountId}/balance`);

// Transactions
export const deposit = (data) => api.post('/api/transactions/deposit', data);
export const transfer = (data) => api.post('/api/transactions/transfer', data);
export const getHistory = (accountId) => api.get(`/api/transactions/history/${accountId}`);