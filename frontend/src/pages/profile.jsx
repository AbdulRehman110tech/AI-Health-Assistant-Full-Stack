// ============================================================
// src/pages/Profile.jsx
// Personal Information Page — View + Edit + Delete
//
// API used:
//   GET    /api/v1/me/        → { data: { username, email, full_name, age, gender, phone_number, ... } }
//   PUT    /api/v1/me/update  → { full_name?, age?, gender?, phone_number? }
//   DELETE /api/v1/me/delete  → permanent deletion
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Calendar, Shield,
  Trash2, AlertTriangle, Loader2, AlertCircle,
  CheckCircle2, UserCircle, X, Info,
  Pencil, Save, XCircle,
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

// ─── Variants ──────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
}

const modalVariant = {
  hidden: { opacity: 0, scale: 0.93, y: 20 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.28, ease: 'easeOut' } },
  exit:   { opacity: 0, scale: 0.96, y: 8,  transition: { duration: 0.18 } },
}

// ─── Helpers ───────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

// ─── Read-only Info Row ────────────────────────────────────

function InfoRow({ icon: Icon, label, value, color = '#00D4FF' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '13px 16px', borderRadius: '11px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.055)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '10px', color: '#4A5568', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>
          {label}
        </p>
        <p style={{
          fontSize: '13px', margin: 0,
          color: value ? '#F0F4FF' : '#4A5568',
          fontStyle: value ? 'normal' : 'italic',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  )
}

// ─── Editable Field ────────────────────────────────────────

function EditField({ icon: Icon, label, name, value, onChange, type = 'text', color = '#00D4FF', options }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '10px 16px', borderRadius: '11px',
      background: 'rgba(0,212,255,0.04)',
      border: '1px solid rgba(0,212,255,0.15)',
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '10px', color: '#4A5568', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>
          {label}
        </p>
        {options ? (
          <select
            name={name}
            value={value || ''}
            onChange={onChange}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '7px 10px',
              color: '#F0F4FF', fontSize: '13px',
              outline: 'none', colorScheme: 'dark', cursor: 'pointer',
            }}
          >
            <option value="">Select…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '7px 10px',
              color: '#F0F4FF', fontSize: '13px',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        )}
      </div>
    </div>
  )
}

// ─── Delete Confirmation Modal ─────────────────────────────

function DeleteModal({ onCancel, onConfirm, deleting, deleteError }) {
  const [typed, setTyped] = useState('')
  const confirmed = typed === 'DELETE'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        variants={modalVariant} initial="hidden" animate="show" exit="exit"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '420px',
          background: 'linear-gradient(135deg, #0d1117, #111827)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="#EF4444" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
                Delete Account
              </h3>
              <p style={{ fontSize: '12px', color: '#8B95A8', margin: '3px 0 0' }}>This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onCancel} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#8B95A8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Warning list */}
        <div style={{
          padding: '14px', borderRadius: '12px', marginBottom: '20px',
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <p style={{ fontSize: '12px', color: '#FCA5A5', fontWeight: 600, margin: '0 0 10px' }}>
            The following will be permanently erased:
          </p>
          {[
            'Your account and login access',
            'All personal & patient information',
            'Prediction history',
            'Medical reports',
            'Doctor appointments',
            'Reminders',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#8B95A8' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Type to confirm */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            fontSize: '12px', fontWeight: 600, color: '#8B95A8',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            display: 'block', marginBottom: '8px',
          }}>
            Type <span style={{ color: '#EF4444', fontFamily: 'monospace' }}>DELETE</span> to confirm
          </label>
          <input
            type="text" value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="Type DELETE here…"
            autoComplete="off"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${confirmed ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: '#F0F4FF', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'monospace', transition: 'border-color 0.2s',
            }}
          />
        </div>

        {deleteError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', fontSize: '12px',
          }}>
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            {deleteError}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', borderRadius: '11px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#8B95A8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: confirmed && !deleting ? 1.02 : 1 }}
            whileTap={{   scale: confirmed && !deleting ? 0.97 : 1 }}
            onClick={() => confirmed && !deleting && onConfirm()}
            disabled={!confirmed || deleting}
            style={{
              flex: 1, padding: '11px', borderRadius: '11px', border: 'none',
              background: confirmed ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'rgba(239,68,68,0.15)',
              color: confirmed ? '#fff' : 'rgba(239,68,68,0.4)',
              fontSize: '13px', fontWeight: 700,
              cursor: confirmed && !deleting ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: confirmed ? '0 4px 16px rgba(220,38,38,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {deleting
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</>
              : <><Trash2 size={14} /> Delete Account</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Profile() {
  const navigate   = useNavigate()
  const { logout } = useAuth()

  // ── Data ──────────────────────────────────────────────────
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // ── Edit mode ─────────────────────────────────────────────
  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState({})   // working copy
  const [saving, setSaving]       = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // ── Delete ────────────────────────────────────────────────
  const [showModal, setShowModal]     = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // ── Fetch profile ─────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/v1/me/')
        setData(res.data.data)
      } catch {
        setFetchError('Failed to load profile. Please refresh.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── Edit handlers ─────────────────────────────────────────
  const startEdit = () => {
    setForm({
      full_name:    data?.full_name    || '',
      age:          data?.age          || '',
      gender:       data?.gender       || '',
      phone_number: data?.phone_number || '',
    })
    setSaveSuccess(false)
    setSaveError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setSaveError(null)
  }

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const payload = {
        full_name:    form.full_name    || null,
        age:          form.age ? parseInt(form.age, 10) : null,
        gender:       form.gender       || null,
        phone_number: form.phone_number || null,
      }
      const res = await api.put('/api/v1/me/update', payload)
      setData(res.data.data)       // update local state immediately
      setSaveSuccess(true)
      setEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const msg =
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        'Save failed. Please try again.'
      setSaveError(typeof msg === 'string' ? msg : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.delete('/api/v1/me/delete')
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        'Deletion failed. Please try again.'
      setDeleteError(typeof msg === 'string' ? msg : 'Deletion failed.')
      setDeleting(false)
    }
  }

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              borderRadius: '16px', padding: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ height: '11px', width: '25%', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', marginBottom: '14px' }} />
              {[1, 2, 3].map(j => (
                <div key={j} style={{ height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#F87171', fontSize: '13px',
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {fetchError}
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '8px', borderRadius: '12px',
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UserCircle size={20} color="#00D4FF" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
            Personal Information
          </h1>
        </div>
        <p style={{ color: '#8B95A8', fontSize: '14px', margin: 0, paddingLeft: '4px' }}>
          View and manage your account and patient profile.
        </p>
      </motion.div>

      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap',
          padding: '20px 24px', borderRadius: '16px', marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,135,0.04))',
          border: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(12px)',
          maxWidth: '720px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,135,0.1))',
            border: '2px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={24} color="#00D4FF" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#F0F4FF', margin: '0 0 4px' }}>
              {data?.full_name || data?.username || '—'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 6px rgba(0,255,135,0.7)' }} />
              <span style={{ fontSize: '12px', color: '#00FF87', fontWeight: 600 }}>Active Account</span>
            </div>
          </div>
        </div>

        {/* Edit / Cancel toggle */}
        {!editing ? (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={startEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
              color: '#00D4FF', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Pencil size={13} /> Edit Profile
          </motion.button>
        ) : (
          <button
            onClick={cancelEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#8B95A8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <XCircle size={13} /> Cancel
          </button>
        )}
      </motion.div>

      {/* Save success banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" exit="hidden"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
              background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)',
              color: '#00FF87', fontSize: '13px', fontWeight: 600, maxWidth: '720px',
            }}
          >
            <CheckCircle2 size={15} />
            Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info / Edit grid */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: '16px', maxWidth: '720px', marginBottom: '24px',
        }}
      >
        {/* Account Details — always read-only */}
        <motion.div variants={fadeUp} style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '20px', backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#00D4FF', marginBottom: '14px' }}>
            Account Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InfoRow icon={User}     label="Username"      value={data?.username}            color="#00D4FF" />
            <InfoRow icon={Mail}     label="Email"         value={data?.email}               color="#38BDF8" />
            <InfoRow icon={Calendar} label="Member Since"  value={formatDate(data?.member_since)} color="#A78BFA" />
            <InfoRow icon={Shield}   label="Status"
              value={data?.is_active ? 'Active' : 'Inactive'}
              color={data?.is_active ? '#00FF87' : '#F87171'}
            />
          </div>
        </motion.div>

        {/* Patient Profile — editable when editing === true */}
        <motion.div variants={fadeUp} style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          border: editing ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '20px', backdropFilter: 'blur(12px)',
          transition: 'border-color 0.2s',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#00FF87', marginBottom: '14px' }}>
            Patient Profile
          </div>

          <AnimatePresence mode="wait">
            {!editing ? (
              // ── View mode ────────────────────────────────
              <motion.div key="view"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <InfoRow icon={User}  label="Full Name" value={data?.full_name}                   color="#00FF87" />
                <InfoRow icon={Info}  label="Age"       value={data?.age ? `${data.age} years` : null} color="#F59E0B" />
                <InfoRow icon={User}  label="Gender"    value={data?.gender}                      color="#E879F9" />
                <InfoRow icon={Phone} label="Phone"     value={data?.phone_number}                color="#34D399" />
              </motion.div>
            ) : (
              // ── Edit mode ─────────────────────────────────
              <motion.div key="edit"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <EditField icon={User}  label="Full Name"    name="full_name"    value={form.full_name}    onChange={handleFormChange} color="#00FF87" />
                <EditField icon={Info}  label="Age"          name="age"          value={form.age}          onChange={handleFormChange} type="number" color="#F59E0B" />
                <EditField icon={User}  label="Gender"       name="gender"       value={form.gender}       onChange={handleFormChange} color="#E879F9"
                  options={['Male', 'Female', 'Other', 'Prefer not to say']}
                />
                <EditField icon={Phone} label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleFormChange} color="#34D399" />

                {/* Save error */}
                <AnimatePresence>
                  {saveError && (
                    <motion.div
                      variants={fadeUp} initial="hidden" animate="show" exit="hidden"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 12px', borderRadius: '10px', marginTop: '4px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#F87171', fontSize: '12px',
                      }}
                    >
                      <AlertCircle size={13} style={{ flexShrink: 0 }} />
                      {saveError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save button */}
                <motion.button
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{   scale: saving ? 1 : 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    marginTop: '6px', width: '100%', padding: '11px',
                    borderRadius: '11px', border: 'none',
                    background: saving
                      ? 'rgba(0,212,255,0.15)'
                      : 'linear-gradient(135deg, #0099CC, #0066FF)',
                    color: '#F0F4FF', fontSize: '13px', fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                    boxShadow: saving ? 'none' : '0 6px 20px rgba(0,153,204,0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  {saving
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                    : <><Save size={14} /> Save Changes</>
                  }
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        style={{
          padding: '20px 24px', borderRadius: '16px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
          maxWidth: '720px',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#EF4444', marginBottom: '6px' }}>
              Danger Zone
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
              Delete Account
            </h3>
            <p style={{ fontSize: '13px', color: '#8B95A8', margin: 0, lineHeight: 1.5 }}>
              Permanently remove your account and all associated data. Irreversible.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModal(true); setDeleteError(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '11px', border: 'none',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#EF4444', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(239,68,68,0.1)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          >
            <Trash2 size={14} /> Delete Account
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showModal && (
          <DeleteModal
            onCancel={() => { setShowModal(false); setDeleteError(null) }}
            onConfirm={handleDelete}
            deleting={deleting}
            deleteError={deleteError}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  )
}