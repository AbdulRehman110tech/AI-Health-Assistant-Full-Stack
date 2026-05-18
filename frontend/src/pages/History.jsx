import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History as HistoryIcon, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2 
} from 'lucide-react'
import api from '../api/axios'

// Reused exact animation variants from Predict.jsx
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const chipVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1,  transition: { duration: 0.2 } },
}

// Reused Tailwind-based ConfidenceBar from Predict.jsx
function ConfidenceBar({ value, color = 'from-cyan-500 to-blue-500', delay = 0 }) {
  return (
    <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
  )
}

// Read-only version of the SymptomChip
function ReadOnlySymptomChip({ label }) {
  if (!label || label.trim() === '') return null;
  return (
    <motion.span
      variants={chipVariant} initial="hidden" animate="show" layout
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium select-none capitalize"
    >
      {label.replace(/_/g, ' ')}
    </motion.span>
  )
}

export default function History() {
  const [historyData, setHistoryData] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true)
        setHistoryError(null)
        const response = await api.get('/api/v1/history')
        
        // Ensure we are setting the array from response.data.history
        if (response.data && response.data.status === 'success') {
          // Sort to show newest first (optional, backend might already do this)
          const sortedHistory = (response.data.history || []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
          setHistoryData(sortedHistory)
        } else {
          setHistoryData([])
        }
      } catch (err) {
        const msg = err.response?.data?.detail?.message || err.response?.data?.detail || 'Failed to load history. Please try again.'
        setHistoryError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown Date';
    const date = new Date(isoString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HistoryIcon size={20} color="#00D4FF" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
            Prediction History
          </h1>
        </div>
        <p style={{ color: '#8B95A8', fontSize: '14px', margin: 0, paddingLeft: '4px' }}>
          Review your past AI diagnostic analyses and symptom records.
        </p>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {historyError && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" exit="hidden"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '12px', marginBottom: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '13px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {historyError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {historyLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '80px 24px', color: '#8B95A8' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#00D4FF' }} />
          <span style={{ fontSize: '14px' }}>Fetching your medical history...</span>
        </div>
      ) : historyData.length === 0 ? (
        /* Empty State */
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '80px 24px', textAlign: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Activity size={26} color="rgba(139,149,168,0.4)" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(240,244,255,0.3)', margin: '0 0 6px' }}>No history found</p>
            <p style={{ fontSize: '12px', color: 'rgba(139,149,168,0.4)', margin: 0, lineHeight: 1.6 }}>You haven't run any AI predictions yet.</p>
          </div>
        </motion.div>
      ) : (
        /* History Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))', gap: '20px', alignItems: 'start' }}>
          {historyData.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)', gap: '16px' }}
            >
              
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#00D4FF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <CheckCircle2 size={13} /> Predicted Condition
                  </div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
                    {item.predicted_disease}
                  </h3>
                </div>
                
                {/* Confidence Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 900, color: '#00D4FF', lineHeight: 1 }}>
                    {Number(item.confidence).toFixed(1)}<span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.6 }}>%</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8B95A8', marginTop: '4px' }}>confidence</div>
                </div>
              </div>

              <ConfidenceBar value={item.confidence} delay={0.2 + (index * 0.1)} />

              {/* Date & Time Context */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B95A8', fontSize: '12px' }}>
                  <Calendar size={14} />
                  {formatDate(item.created_at)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B95A8', fontSize: '12px' }}>
                  <Clock size={14} />
                  {formatTime(item.created_at)}
                </div>
              </div>

              {/* Symptoms List */}
              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8B95A8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Reported Symptoms
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {item.symptoms && item.symptoms.map((symp, idx) => (
                    <ReadOnlySymptomChip key={idx} label={symp} />
                  ))}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}