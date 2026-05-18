// ============================================================
// src/pages/Dashboard.jsx
// Dashboard Home — Central Control Panel
// ============================================================

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, UserCheck, FileText, History, Bell, Brain, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const actions = [
  {
    path:        '/predict',
    label:       'Disease Prediction',
    description: 'Enter symptoms and get AI-powered disease predictions',
    icon:        Brain,
    gradient:    'linear-gradient(135deg, #00D4FF22, #00D4FF08)',
    border:      'rgba(0, 212, 255, 0.2)',
    iconColor:   '#00D4FF',
    glow:        'rgba(0, 212, 255, 0.15)',
  },
  {
    path:        '/doctors',
    label:       'Doctor Recommendations',
    description: 'Find and book appointments with specialist doctors',
    icon:        UserCheck,
    gradient:    'linear-gradient(135deg, #00FF8722, #00FF8708)',
    border:      'rgba(0, 255, 135, 0.2)',
    iconColor:   '#00FF87',
    glow:        'rgba(0, 255, 135, 0.15)',
  },
  {
    path:        '/reports',
    label:       'Medical Reports',
    description: 'Upload and manage your medical documents securely',
    icon:        FileText,
    gradient:    'linear-gradient(135deg, #A78BFA22, #A78BFA08)',
    border:      'rgba(167, 139, 250, 0.2)',
    iconColor:   '#A78BFA',
    glow:        'rgba(167, 139, 250, 0.15)',
  },
  {
    path:        '/history',
    label:       'Prediction History',
    description: 'Review your past AI health predictions and results',
    icon:        History,
    gradient:    'linear-gradient(135deg, #F59E0B22, #F59E0B08)',
    border:      'rgba(245, 158, 11, 0.2)',
    iconColor:   '#F59E0B',
    glow:        'rgba(245, 158, 11, 0.15)',
  },
  {
    path:        '/reminders',
    label:       'Reminders',
    description: 'Set medication and appointment reminders',
    icon:        Bell,
    gradient:    'linear-gradient(135deg, #F4726422, #F4726408)',
    border:      'rgba(244, 114, 100, 0.2)',
    iconColor:   '#F47264',
    glow:        'rgba(244, 114, 100, 0.15)',
  },
  {
    path:        '/predict',
    label:       'Quick Check',
    description: 'Fast symptom check — get results in seconds',
    icon:        Activity,
    gradient:    'linear-gradient(135deg, #38BDF822, #38BDF808)',
    border:      'rgba(56, 189, 248, 0.2)',
    iconColor:   '#38BDF8',
    glow:        'rgba(56, 189, 248, 0.15)',
  },
  // ── Phase 3G addition ──────────────────────────────────
  {
    path:        '/profile',
    label:       'Personal Info',
    description: 'View your account details and manage your profile',
    icon:        UserCircle,
    gradient:    'linear-gradient(135deg, #34D39922, #34D39908)',
    border:      'rgba(52, 211, 153, 0.2)',
    iconColor:   '#34D399',
    glow:        'rgba(52, 211, 153, 0.15)',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Dashboard() {
  const { username } = useAuth()
  const navigate     = useNavigate()

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '40px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#00FF87', boxShadow: '0 0 12px rgba(0,255,135,0.7)',
          }} />
          <span style={{ fontSize: '13px', color: '#00FF87', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            System Online
          </span>
        </div>
        <h1 style={{ fontSize: '32px', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#F0F4FF', marginBottom: '8px' }}>
          Welcome back{username ? `, ${username}` : ''} 👋
        </h1>
        <p style={{ color: '#8B95A8', fontSize: '15px' }}>
          Your AI health assistant is ready. What would you like to do today?
        </p>
      </motion.div>

      {/* Action Cards Grid */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}
      >
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.label}
              variants={item}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: action.gradient, border: `1px solid ${action.border}`,
                borderRadius: '16px', padding: '24px', cursor: 'pointer',
                backdropFilter: 'blur(12px)', transition: 'box-shadow 0.2s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${action.glow}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{
                width: '44px', height: '44px', background: `${action.iconColor}18`,
                border: `1px solid ${action.iconColor}30`, borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
              }}>
                <Icon size={20} color={action.iconColor} strokeWidth={2} />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#F0F4FF', marginBottom: '6px' }}>
                {action.label}
              </h3>
              <p style={{ fontSize: '13px', color: '#8B95A8', lineHeight: 1.5 }}>
                {action.description}
              </p>
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: action.iconColor, fontSize: '18px', opacity: 0.6 }}>
                →
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}