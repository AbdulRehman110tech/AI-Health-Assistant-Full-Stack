// ============================================================
// src/pages/Doctors.jsx
// Doctor Recommendations with Disease-to-Specialization Filter
// ============================================================

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, UserCheck, Building2, Clock,
  DollarSign, X, CalendarCheck, CheckCircle2,
  AlertCircle, Loader2, Stethoscope, ChevronDown, Brain,
} from 'lucide-react'
import api from '../api/axios'

// ============================================================
// DISEASE → SPECIALIZATION MAPPING
// Covers all 41 diseases from your trained ML model
// ============================================================
const DISEASE_TO_SPECIALIZATION = {
  'Fungal infection':          'Dermatologist',
  'Allergy':                   'General Physician',
  'GERD':                      'Gastroenterologist',
  'Chronic cholestasis':       'Gastroenterologist',
  'Drug Reaction':             'Dermatologist',
  'Peptic ulcer diseae':       'Gastroenterologist',
  'AIDS':                      'General Physician',
  'Diabetes':                  'Endocrinologist',
  'Gastroenteritis':           'Gastroenterologist',
  'Bronchial Asthma':          'Pulmonologist',
  'Hypertension ':             'Cardiologist',
  'Migraine':                  'Neurologist',
  'Cervical spondylosis':      'Orthopedic',
  'Paralysis (brain hemorrhage)': 'Neurologist',
  'Jaundice':                  'Gastroenterologist',
  'Malaria':                   'General Physician',
  'Chicken pox':               'General Physician',
  'Dengue':                    'General Physician',
  'Typhoid':                   'General Physician',
  'hepatitis A':               'Gastroenterologist',
  'Hepatitis B':               'Gastroenterologist',
  'Hepatitis C':               'Gastroenterologist',
  'Hepatitis D':               'Gastroenterologist',
  'Hepatitis E':               'Gastroenterologist',
  'Alcoholic hepatitis':       'Gastroenterologist',
  'Tuberculosis':              'Pulmonologist',
  'Common Cold':               'General Physician',
  'Pneumonia':                 'Pulmonologist',
  'Dimorphic hemmorhoids(piles)': 'General Physician',
  'Heart attack':              'Cardiologist',
  'Varicose veins':            'General Physician',
  'Hypothyroidism':            'Endocrinologist',
  'Hyperthyroidism':           'Endocrinologist',
  'Hypoglycemia':              'Endocrinologist',
  'Osteoarthristis':           'Orthopedic',
  'Arthritis':                 'Orthopedic',
  '(vertigo) Paroymsal  Positional Vertigo': 'Neurologist',
  'Acne':                      'Dermatologist',
  'Urinary tract infection':   'General Physician',
  'Psoriasis':                 'Dermatologist',
  'Impetigo':                  'Dermatologist',
}

const SPECIALIZATIONS = [
  'All',
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Orthopedic',
  'General Physician',
  'ENT Specialist',
  'Gastroenterologist',
  'Pulmonologist',
  'Psychiatrist',
  'Endocrinologist',
]

const SPEC_COLORS = {
  'Cardiologist':      { accent: '#FF6B6B', bg: 'rgba(255,107,107,0.1)',  border: 'rgba(255,107,107,0.2)'  },
  'Neurologist':       { accent: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  'Dermatologist':     { accent: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  'Orthopedic':        { accent: '#00D4FF', bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.2)'   },
  'General Physician': { accent: '#00FF87', bg: 'rgba(0,255,135,0.1)',   border: 'rgba(0,255,135,0.2)'   },
  'ENT Specialist':    { accent: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)'  },
  'Gastroenterologist':{ accent: '#FB923C', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)'  },
  'Pulmonologist':     { accent: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  'Psychiatrist':      { accent: '#E879F9', bg: 'rgba(232,121,249,0.1)', border: 'rgba(232,121,249,0.2)' },
  'Endocrinologist':   { accent: '#FACC15', bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.2)'  },
}

const getColor = (spec) =>
  SPEC_COLORS[spec] || { accent: '#00D4FF', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)' }

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.35, ease: 'easeOut' } },
}

const modalVariant = {
  hidden: { opacity: 0, scale: 0.93, y: 20 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:   { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
}

// ============================================================
// BOOKING MODAL
// ============================================================
function BookingModal({ doctor, onClose, onConfirm, loading, success, error }) {
  const color = getColor(doctor.specialization)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const [appointmentTime, setAppointmentTime] = useState(tomorrow.toISOString().slice(0, 16))

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <motion.div
        variants={modalVariant} initial="hidden" animate="show" exit="exit"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          background: 'linear-gradient(135deg, #111827, #0d1117)',
          border: `1px solid ${color.border}`,
          borderRadius: '20px', padding: '28px',
          boxShadow: `0 24px 64px rgba(0,0,0,0.6)`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: color.accent, marginBottom: '6px' }}>
              Book Appointment
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
              {doctor.full_name}
            </h3>
            <p style={{ fontSize: '13px', color: '#8B95A8', margin: '4px 0 0' }}>
              {doctor.specialization} · {doctor.hospital_name}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#8B95A8', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        {success ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={26} color="#00FF87" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>Appointment Booked!</p>
              <p style={{ fontSize: '13px', color: '#8B95A8', margin: 0 }}>Your appointment has been confirmed.</p>
            </div>
            <button onClick={onClose} style={{ marginTop: '8px', padding: '10px 28px', borderRadius: '10px', border: 'none', background: 'rgba(0,255,135,0.15)', color: '#00FF87', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Done
            </button>
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '12px', marginBottom: '18px', background: color.bg, border: `1px solid ${color.border}` }}>
              <DollarSign size={14} color={color.accent} />
              <span style={{ fontSize: '13px', color: color.accent, fontWeight: 600 }}>
                Consultation Fee: PKR {doctor.consultation_fee.toLocaleString()}
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#8B95A8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                value={appointmentTime}
                onChange={e => setAppointmentTime(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF', fontSize: '13px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '13px' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(doctor.id, appointmentTime)}
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: loading ? 'rgba(0,212,255,0.2)' : `linear-gradient(135deg, ${color.accent}CC, ${color.accent}88)`,
                color: '#F0F4FF', fontSize: '14px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Booking…</> : <><CalendarCheck size={15} /> Confirm Appointment</>}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// DOCTOR CARD
// ============================================================
function DoctorCard({ doctor, onBook }) {
  const color = getColor(doctor.specialization)
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color.bg}` }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '20px',
        backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '99px',
        background: doctor.availability_status ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${doctor.availability_status ? 'rgba(0,255,135,0.25)' : 'rgba(255,255,255,0.1)'}`,
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: doctor.availability_status ? '#00FF87' : '#8B95A8', boxShadow: doctor.availability_status ? '0 0 8px rgba(0,255,135,0.6)' : 'none' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: doctor.availability_status ? '#00FF87' : '#8B95A8' }}>
          {doctor.availability_status ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color.bg, border: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
        <Stethoscope size={20} color={color.accent} />
      </div>

      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: '#F0F4FF', margin: '0 0 4px', paddingRight: '80px' }}>
        {doctor.full_name}
      </h3>
      <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: color.bg, border: `1px solid ${color.border}`, color: color.accent, marginBottom: '14px' }}>
        {doctor.specialization}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={13} color="#8B95A8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#8B95A8' }}>{doctor.hospital_name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={13} color="#8B95A8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#8B95A8' }}>{doctor.years_of_experience} years experience</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={13} color="#8B95A8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#8B95A8' }}>PKR {doctor.consultation_fee.toLocaleString()} / visit</span>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

      <motion.button
        whileHover={{ scale: doctor.availability_status ? 1.02 : 1 }}
        whileTap={{  scale: doctor.availability_status ? 0.97 : 1 }}
        onClick={() => doctor.availability_status && onBook(doctor)}
        disabled={!doctor.availability_status}
        style={{
          width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
          background: doctor.availability_status ? `linear-gradient(135deg, ${color.accent}22, ${color.accent}11)` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${doctor.availability_status ? color.border : 'rgba(255,255,255,0.07)'}`,
          color: doctor.availability_status ? color.accent : '#8B95A8',
          fontSize: '13px', fontWeight: 600,
          cursor: doctor.availability_status ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          transition: 'all 0.2s',
        }}
      >
        <CalendarCheck size={14} />
        {doctor.availability_status ? 'Book Appointment' : 'Not Available'}
      </motion.button>
    </motion.div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Doctors() {
  const [doctors,     setDoctors]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState(null)
  const [search,      setSearch]      = useState('')
  const [specFilter,  setSpecFilter]  = useState('All')
  const [availOnly,   setAvailOnly]   = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [diseaseInput, setDiseaseInput] = useState('')
  const [autoFilled,   setAutoFilled]   = useState(false)

  // Booking
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [booking,        setBooking]        = useState(false)
  const [bookSuccess,    setBookSuccess]    = useState(false)
  const [bookError,      setBookError]      = useState(null)

  // ── Auto-fill from Predict page ────────────────────────
  useEffect(() => {
    const savedDisease = localStorage.getItem('predicted_disease')
    if (savedDisease) {
      setDiseaseInput(savedDisease)
      const spec = DISEASE_TO_SPECIALIZATION[savedDisease]
      if (spec) {
        setSpecFilter(spec)
        setShowFilters(true)
        setAutoFilled(true)
      }
      localStorage.removeItem('predicted_disease')
    }
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/v1/doctors/')
      setDoctors(res.data.doctors || [])
    } catch {
      setFetchError('Failed to load doctors. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  // ── Disease input handler ───────────────────────────────
  const handleDiseaseInput = (value) => {
    setDiseaseInput(value)
    setAutoFilled(false)
    const spec = DISEASE_TO_SPECIALIZATION[value.trim()]
    if (spec) {
      setSpecFilter(spec)
      setShowFilters(true)
    } else if (value === '') {
      setSpecFilter('All')
    }
  }

  // ── Client-side filtering ───────────────────────────────
  const filtered = useMemo(() => {
    return doctors.filter(d => {
      const matchSearch = search === '' ||
        d.full_name.toLowerCase().includes(search.toLowerCase()) ||
        d.hospital_name.toLowerCase().includes(search.toLowerCase())
      const matchSpec  = specFilter === 'All' || d.specialization === specFilter
      const matchAvail = !availOnly || d.availability_status
      return matchSearch && matchSpec && matchAvail
    })
  }, [doctors, search, specFilter, availOnly])

  const handleConfirmBooking = async (doctorId, appointmentTime) => {
    setBooking(true)
    setBookError(null)
    try {
      await api.post('/api/v1/doctors/book', {
        doctor_id: doctorId,
        appointment_time: new Date(appointmentTime).toISOString(),
      })
      setBookSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail?.message || 'Booking failed.'
      setBookError(typeof msg === 'string' ? msg : 'Booking failed.')
    } finally {
      setBooking(false)
    }
  }

  const openModal  = (doctor) => { setSelectedDoctor(doctor); setBookSuccess(false); setBookError(null) }
  const closeModal = () => { setSelectedDoctor(null); setBookSuccess(false); setBookError(null) }

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={20} color="#00FF87" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
            Doctor Recommendations
          </h1>
        </div>
        <p style={{ color: '#8B95A8', fontSize: '14px', margin: 0, paddingLeft: '4px' }}>
          Browse specialists and book appointments instantly.
        </p>
      </motion.div>

      {/* Auto-fill banner */}
      <AnimatePresence>
        {autoFilled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              fontSize: '13px', color: '#00D4FF',
            }}
          >
            <Brain size={15} style={{ flexShrink: 0 }} />
            <span>
              AI predicted <strong>{diseaseInput}</strong> — showing recommended{' '}
              <strong>{specFilter}s</strong> for you.
            </span>
            <button
              onClick={() => { setAutoFilled(false); setDiseaseInput(''); setSpecFilter('All') }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#00D4FF', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disease Filter */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '16px 20px', marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#8B95A8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Filter by Disease
        </p>
        <div style={{ position: 'relative' }}>
          <Brain size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B95A8', pointerEvents: 'none' }} />
          <input
            type="text"
            value={diseaseInput}
            onChange={e => handleDiseaseInput(e.target.value)}
            placeholder="Type a disease name (e.g. Malaria, Diabetes, Heart attack)…"
            style={{
              width: '100%', paddingLeft: '36px', paddingRight: '14px',
              paddingTop: '10px', paddingBottom: '10px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F0F4FF', fontSize: '13px',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        {diseaseInput && DISEASE_TO_SPECIALIZATION[diseaseInput.trim()] && (
          <p style={{ fontSize: '12px', color: '#00FF87', marginTop: '8px' }}>
            → Showing <strong>{DISEASE_TO_SPECIALIZATION[diseaseInput.trim()]}s</strong>
          </p>
        )}
        {diseaseInput && !DISEASE_TO_SPECIALIZATION[diseaseInput.trim()] && (
          <p style={{ fontSize: '12px', color: '#8B95A8', marginTop: '8px' }}>
            No exact match — try full disease name or use specialization filter below.
          </p>
        )}
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B95A8', pointerEvents: 'none' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or hospital…"
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,135,0.4)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: showFilters ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)', border: showFilters ? '1px solid rgba(0,255,135,0.25)' : '1px solid rgba(255,255,255,0.1)', color: showFilters ? '#00FF87' : '#8B95A8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            <Filter size={14} />
            Specialization
            <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <button onClick={() => setAvailOnly(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: availOnly ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)', border: availOnly ? '1px solid rgba(0,255,135,0.25)' : '1px solid rgba(255,255,255,0.1)', color: availOnly ? '#00FF87' : '#8B95A8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: availOnly ? '#00FF87' : '#8B95A8', boxShadow: availOnly ? '0 0 6px rgba(0,255,135,0.7)' : 'none' }} />
            Available Only
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                {SPECIALIZATIONS.map(spec => {
                  const active = specFilter === spec
                  const c = spec === 'All' ? { accent: '#00D4FF', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)' } : getColor(spec)
                  return (
                    <button key={spec} onClick={() => setSpecFilter(spec)}
                      style={{ padding: '6px 14px', borderRadius: '99px', background: active ? c.bg : 'rgba(255,255,255,0.04)', border: active ? `1px solid ${c.border}` : '1px solid rgba(255,255,255,0.08)', color: active ? c.accent : '#8B95A8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {spec}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result count */}
      {!loading && !fetchError && (
        <p style={{ fontSize: '12px', color: '#8B95A8', marginBottom: '16px' }}>
          Showing <span style={{ color: '#F0F4FF', fontWeight: 600 }}>{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
          {specFilter !== 'All' && ` · ${specFilter}`}
          {availOnly && ' · Available only'}
        </p>
      )}

      {/* Fetch error */}
      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '12px', marginBottom: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '13px' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {fetchError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: '16px', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', marginBottom: '14px' }} />
              <div style={{ height: '14px', width: '60%', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', marginBottom: '8px' }} />
              <div style={{ height: '36px', width: '100%', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', marginTop: '16px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !fetchError && filtered.length === 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '64px 24px', textAlign: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Stethoscope size={28} color="rgba(139,149,168,0.35)" />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(240,244,255,0.3)', margin: 0 }}>No doctors found</p>
        </motion.div>
      )}

      {/* Doctor grid */}
      {!loading && !fetchError && filtered.length > 0 && (
        <motion.div
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}
        >
          {filtered.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} onBook={openModal} />)}
        </motion.div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <BookingModal
            doctor={selectedDoctor} onClose={closeModal}
            onConfirm={handleConfirmBooking}
            loading={booking} success={bookSuccess} error={bookError}
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