// ============================================================
// src/pages/Register.jsx
// Register Page
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/v1/auth/register', {
        username: form.username,
        email:    form.email,
        password: form.password,
      })
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#F0F4FF',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: '#8B95A8', marginBottom: '8px',
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
          Create account
        </h1>
        <p style={{ color: '#8B95A8', fontSize: '14px' }}>
          Join HealthAI — your AI health companion
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '32px',
        backdropFilter: 'blur(12px)',
      }}>
        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password" value={form.password} onChange={handleChange}
                placeholder="Min 6 characters"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8B95A8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat your password" style={inputStyle} />
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#FF6B6B', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#00FF87', fontSize: '13px', marginBottom: '16px' }}>
              {success}
            </motion.div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(0,212,255,0.4)' : 'linear-gradient(135deg, #00D4FF, #0099CC)',
              border: 'none', borderRadius: '10px',
              color: '#080B12', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'Syne, sans-serif',
            }}>
            {loading ? <><Loader2 size={16} /> Creating account...</> : 'Create Account'}
          </button>

        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8B95A8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#00D4FF', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}