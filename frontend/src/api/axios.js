// ============================================================
// src/api/axios.js
// Centralized Axios Instance
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
    // IMPORTANT FIX: 
    // Check if this request was attempting to log in.
    const isLoginRequest = error.config?.url?.includes('/auth/token');

    // ONLY redirect/reload if it is a 401 AND it is NOT the login form
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    
    // Pass the error back down to the component (so Login.jsx can read it)
    return Promise.reject(error)
  }
)

export default api