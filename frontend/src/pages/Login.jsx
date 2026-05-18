// ============================================================
// src/pages/Login.jsx
// Login Page
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const [form,     setForm]    = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      // OAuth2 form data format
      const params = new URLSearchParams()
      params.append('username', form.username)
      params.append('password', form.password)

      const res = await api.post('/api/v1/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      login(res.data.access_token, form.username)
      navigate('/dashboard')
    } catch (err) {
      // Extract backend error message cleanly
      const errorDetail = err.response?.data?.detail
      const backendMessage = typeof errorDetail === 'string' ? errorDetail : errorDetail?.message
      
      // 1. Check for User Not Found scenario (Status 404 OR specific keywords)
      const isUserNotFound = 
        err.response?.status === 404 || 
        (backendMessage && backendMessage.toLowerCase().includes('not found')) ||
        (backendMessage && backendMessage.toLowerCase().includes('exist'))

      if (isUserNotFound) {
        setError('Please register first')
      } else {
        // 2. Preserve existing Invalid Password / Generic error behavior
        setError(backendMessage || 'Invalid username or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '48px', height: '48px',
          background: 'linear-gradient(135deg, #00D4FF, #00FF87)',
          borderRadius: '12px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Heart size={22} color="#080B12" strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: '26px', fontFamily: 'Syne, sans-serif', color: '#F0F4FF', marginBottom: '6px' }}>
          Welcome back
        </h1>
        <p style={{ color: '#8B95A8', fontSize: '14px' }}>
          Sign in to your HealthAI account
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '32px',
        backdropFilter: 'blur(12px)',
      }}>
        <form onSubmit={handleSubmit}>

          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#8B95A8', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#F0F4FF',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#8B95A8', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  width: '100%', padding: '12px 44px 12px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#F0F4FF',
                  fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#8B95A8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message Container (Preserved styling, strictly outputs correct message) */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 80, 80, 0.1)',
                border: '1px solid rgba(255, 80, 80, 0.3)',
                borderRadius: '8px', padding: '10px 14px',
                color: '#FF6B6B', fontSize: '13px', marginBottom: '16px',
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(0,212,255,0.4)' : 'linear-gradient(135deg, #00D4FF, #0099CC)',
              border: 'none', borderRadius: '10px',
              color: '#080B12', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'Syne, sans-serif',
              transition: 'opacity 0.2s ease',
            }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
          </button>

        </form>

        {/* Register Link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8B95A8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#00D4FF', textDecoration: 'none', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}