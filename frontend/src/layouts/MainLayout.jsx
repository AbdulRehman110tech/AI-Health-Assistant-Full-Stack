import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Activity, History,
  UserCheck, FileText, Bell,
  Menu, Heart, LogOut, User, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ChatBot from '../components/ChatBot'

const navItems = [
  { path: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/predict',   label: 'Prediction',  icon: Activity },
  { path: '/doctors',   label: 'Doctors',     icon: UserCheck },
  { path: '/reports',   label: 'Reports',     icon: FileText },
  { path: '/history',   label: 'History',     icon: History },
  { path: '/reminders', label: 'Reminders',   icon: Bell },
]

function SidebarContent({ onNav }) {
  const { logout, username } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          width: '34px', height: '34px',
          background: 'linear-gradient(135deg, #00D4FF, #00FF87)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Heart size={17} color="#080B12" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '17px', color: '#F0F4FF' }}>
          HealthAI
        </span>
      </div>

      {/* Section label */}
      <p style={{ fontSize: '10px', color: '#4A5568', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>
        Navigation
      </p>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={onNav}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              transition: 'all 0.15s ease',
              background:  isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
              color:       isActive ? '#00D4FF' : '#8B95A8',
              border:      isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
            })}
          >
            <Icon size={16} strokeWidth={isActive => isActive ? 2.5 : 2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '16px' }}>
        {username && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', marginBottom: '6px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(0,212,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={13} color="#00D4FF" />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#F0F4FF', fontWeight: 600, lineHeight: 1.2 }}>{username}</p>
              <p style={{ fontSize: '11px', color: '#4A5568' }}>Patient</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'transparent', border: 'none',
            color: '#4A5568', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', width: '100%', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FF6B6B'; e.currentTarget.style.background = 'rgba(255,107,107,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#4A5568'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )
}

const sidebarBase = {
  width: '240px',
  background: 'rgba(8,11,18,0.98)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  display: 'flex', flexDirection: 'column',
  padding: '24px 16px',
}

export default function MainLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const pageTitle = location.pathname.replace('/', '') || 'dashboard'

  return (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080B12' }}>

    {/* Mobile overlay */}
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}
    </AnimatePresence>

    {/* Mobile Sidebar */}
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: open ? 0 : '-100%' }}
      transition={{ type: 'tween', duration: 0.22 }}
      style={{
        ...sidebarBase,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50
      }}
    >
      <button
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          color: '#4A5568',
          cursor: 'pointer',
          display: 'flex',
        }}
      >
        <X size={18} />
      </button>

      <SidebarContent onNav={() => setOpen(false)} />
    </motion.aside>

    {/* Desktop Sidebar */}
    <aside style={{ ...sidebarBase, flexShrink: 0 }}>
      <SidebarContent />
    </aside>

    {/* Main */}
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        position: 'relative',
      }}
    >

      {/* Topbar */}
      <header
        style={{
          height: '58px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '14px',
          background: 'rgba(8,11,18,0.85)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
        }}
      >
        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8B95A8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#F0F4FF',
            textTransform: 'capitalize',
          }}
        >
          {pageTitle}
        </span>

        {/* Right side */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#00FF87',
                boxShadow: '0 0 8px rgba(0,255,135,0.7)',
              }}
            />
            <span style={{ fontSize: '12px', color: '#8B95A8' }}>
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '28px 24px',
          position: 'relative',
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Floating AI Assistant */}
      <ChatBot />

    </div>
  </div>
)}