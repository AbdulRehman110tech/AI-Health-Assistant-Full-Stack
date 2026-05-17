// ============================================================
// src/api/axios.js
// Centralized Axios Instance
//
// All API calls go through this instance.
// Base URL points to FastAPI backend.
// Token is automatically attached if present in localStorage.
// ============================================================

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// REQUEST INTERCEPTOR
// Automatically attaches JWT token to every request
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ============================================================
// RESPONSE INTERCEPTOR
// Handles 401 (expired token) globally
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api