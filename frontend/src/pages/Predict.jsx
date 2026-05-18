import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, X, Stethoscope, Brain, ChevronRight,
  AlertCircle, CheckCircle2, Loader2, Sparkles,
  Activity, BarChart3, UserCheck,
} from 'lucide-react'
import api from '../api/axios'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const chipVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1,  transition: { duration: 0.2 } },
  exit:   { opacity: 0, scale: 0.75, transition: { duration: 0.15 } },
}

const resultCard = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

const BAR_COLORS = [
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
]

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

function SymptomChip({ label, onRemove }) {
  return (
    <motion.span
      variants={chipVariant} initial="hidden" animate="show" exit="exit" layout
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium select-none"
    >
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-white transition-colors" aria-label={`Remove ${label}`}>
        <X size={12} />
      </button>
    </motion.span>
  )
}

export default function Predict() {
  const navigate = useNavigate()

  const [allSymptoms,     setAllSymptoms]     = useState([])
  const [symptomsLoading, setSymptomsLoading] = useState(true)
  const [symptomsError,   setSymptomsError]   = useState(null)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [selected,        setSelected]        = useState([])
  const [predicting,      setPredicting]      = useState(false)
  const [result,          setResult]          = useState(null)
  const [predError,       setPredError]       = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setSymptomsLoading(true)
        const res = await api.get('/api/v1/symptoms')
        setAllSymptoms(res.data.symptoms || [])
      } catch {
        setSymptomsError('Failed to load symptoms. Please refresh the page.')
      } finally {
        setSymptomsLoading(false)
      }
    })()
  }, [])

  const filteredSymptoms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const selectedValues = new Set(selected.map(s => s.value))
    return allSymptoms.filter(
      s => !selectedValues.has(s.value) &&
           (q === '' || s.display.toLowerCase().includes(q))
    )
  }, [allSymptoms, selected, searchQuery])

  const addSymptom    = (symptom) => { setSelected(prev => [...prev, symptom]); setSearchQuery(''); setResult(null); setPredError(null) }
  const removeSymptom = (value)   => { setSelected(prev => prev.filter(s => s.value !== value)); setResult(null); setPredError(null) }
  const clearAll      = ()        => { setSelected([]); setResult(null); setPredError(null) }

  const handlePredict = async () => {
    if (selected.length === 0 || predicting) return
    setPredicting(true)
    setPredError(null)
    setResult(null)
    try {
      const res = await api.post('/api/v1/predict', {
        symptoms: selected.map(s => s.value),
      })
      setResult(res.data)
      // Save predicted disease for Doctors page auto-fill
      localStorage.setItem('predicted_disease', res.data.predicted_disease)
    } catch (err) {
      const msg = err.response?.data?.detail?.message || err.response?.data?.detail || 'Prediction failed. Please try again.'
      setPredError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setPredicting(false)
    }
  }

  const handleFindDoctors = () => {
    navigate('/doctors')
  }

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="#00D4FF" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
            Disease Prediction
          </h1>
        </div>
        <p style={{ color: '#8B95A8', fontSize: '14px', margin: 0, paddingLeft: '4px' }}>
          Select your symptoms and let the AI model analyse possible conditions.
        </p>
      </motion.div>

      <AnimatePresence>
        {symptomsError && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" exit="hidden"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '12px', marginBottom: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '13px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {symptomsError}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))', gap: '20px', alignItems: 'start' }}>

        {/* LEFT — Symptom Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B95A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Search Symptoms</span>
              {selected.length > 0 && (
                <button onClick={clearAll} style={{ fontSize: '12px', color: '#8B95A8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => e.target.style.color = '#F87171'} onMouseLeave={e => e.target.style.color = '#8B95A8'}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B95A8', pointerEvents: 'none' }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search symptoms…" disabled={symptomsLoading}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF', fontSize: '13px', outline: 'none', boxSizing: 'border-box', opacity: symptomsLoading ? 0.4 : 1, cursor: symptomsLoading ? 'not-allowed' : 'text' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ height: '220px', overflowY: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {symptomsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: '#8B95A8', fontSize: '13px' }}>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Loading symptoms…
                </div>
              ) : filteredSymptoms.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: '#8B95A8', fontSize: '13px' }}>
                  <Stethoscope size={20} style={{ opacity: 0.4 }} />
                  {searchQuery ? 'No matching symptoms' : 'All symptoms selected'}
                </div>
              ) : (
                <ul style={{ margin: 0, padding: '6px', listStyle: 'none' }}>
                  {filteredSymptoms.map(symptom => (
                    <li key={symptom.value}>
                      <button onClick={() => addSymptom(symptom)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: 'none', border: 'none', color: '#8B95A8', fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.color = '#00D4FF'; e.currentTarget.querySelector('svg').style.opacity = '1' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#8B95A8'; e.currentTarget.querySelector('svg').style.opacity = '0' }}
                      >
                        <span>{symptom.display}</span>
                        <ChevronRight size={13} style={{ opacity: 0, transition: 'opacity 0.15s' }} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', minHeight: '110px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B95A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Selected Symptoms</span>
              <span style={{ fontSize: '12px', color: '#8B95A8' }}>{selected.length} selected</span>
            </div>
            {selected.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(139,149,168,0.5)', fontStyle: 'italic', margin: 0 }}>No symptoms selected yet. Search and click to add.</p>
            ) : (
              <motion.div layout style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <AnimatePresence>
                  {selected.map(s => <SymptomChip key={s.value} label={s.display} onRemove={() => removeSymptom(s.value)} />)}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          <motion.button onClick={handlePredict} disabled={selected.length === 0 || predicting}
            whileHover={{ scale: selected.length > 0 && !predicting ? 1.02 : 1 }}
            whileTap={{  scale: selected.length > 0 && !predicting ? 0.98 : 1 }}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: selected.length === 0 || predicting ? 'rgba(0,212,255,0.2)' : 'linear-gradient(135deg, #0099CC, #0066FF)', color: '#F0F4FF', fontSize: '14px', fontWeight: 700, cursor: selected.length === 0 || predicting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: selected.length > 0 && !predicting ? '0 8px 24px rgba(0,212,255,0.25)' : 'none', opacity: selected.length === 0 || predicting ? 0.6 : 1 }}>
            {predicting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analysing symptoms…</> : <><Sparkles size={16} /> Run AI Prediction</>}
          </motion.button>
        </motion.div>

        {/* RIGHT — Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <AnimatePresence>
            {predError && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" exit="hidden"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '13px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                {predError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!result && !predicting && !predError && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" exit="hidden"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '60px 24px', textAlign: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Activity size={26} color="rgba(139,149,168,0.4)" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(240,244,255,0.3)', margin: '0 0 6px' }}>Awaiting prediction</p>
                  <p style={{ fontSize: '12px', color: 'rgba(139,149,168,0.4)', margin: 0, lineHeight: 1.6 }}>Select symptoms on the left<br />and click "Run AI Prediction"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {predicting && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" exit="hidden"
                style={{ borderRadius: '16px', padding: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ marginBottom: i < 3 ? '20px' : 0 }}>
                    <div style={{ height: '12px', width: '35%', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: '8px', width: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && !predicting && (
              <motion.div variants={resultCard} initial="hidden" animate="show" exit="hidden"
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Primary result */}
                <div style={{ borderRadius: '16px', padding: '24px', background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,102,255,0.05), transparent)', border: '1px solid rgba(0,212,255,0.25)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#00D4FF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        <CheckCircle2 size={13} /> AI Prediction Result
                      </div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#F0F4FF', margin: 0 }}>
                        {result.predicted_disease}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 900, color: '#00D4FF', lineHeight: 1 }}>
                        {result.confidence.toFixed(1)}<span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.6 }}>%</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8B95A8', marginTop: '4px' }}>confidence</div>
                    </div>
                  </div>
                  <ConfidenceBar value={result.confidence} delay={0.3} />
                  <p style={{ fontSize: '12px', color: '#8B95A8', margin: '10px 0 0' }}>
                    Based on {selected.length} symptom{selected.length !== 1 ? 's' : ''} provided
                  </p>
                </div>

                {/* Top predictions */}
                {result.top_predictions?.length > 0 && (
                  <div style={{ borderRadius: '16px', padding: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#8B95A8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                      <BarChart3 size={13} /> Top Predictions
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {result.top_predictions.map((pred, idx) => (
                        <motion.div key={pred.disease} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.1, duration: 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === 0 ? '#00D4FF' : idx === 1 ? '#A78BFA' : '#00FF87', flexShrink: 0 }} />
                              <span style={{ fontSize: '13px', color: idx === 0 ? '#F0F4FF' : '#8B95A8', fontWeight: idx === 0 ? 600 : 400 }}>{pred.disease}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#8B95A8' }}>{pred.confidence.toFixed(1)}%</span>
                          </div>
                          <ConfidenceBar value={pred.confidence} color={BAR_COLORS[idx] || BAR_COLORS[2]} delay={0.2 + idx * 0.1} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: 'rgba(245,158,11,0.7)', fontSize: '12px', lineHeight: 1.5 }}>
                  <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                  This prediction is generated by an ML model for informational purposes only. Always consult a qualified healthcare professional for medical advice.
                </div>

                {/* ── Find Doctors Button ── */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleFindDoctors}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '13px',
                    background: 'rgba(0,255,135,0.1)',
                    border: '1px solid rgba(0,255,135,0.25)',
                    borderRadius: '12px', color: '#00FF87',
                    fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontFamily: 'Syne, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,135,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,135,0.1)'}
                >
                  <UserCheck size={16} />
                  Find Recommended Doctors
                </motion.button>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  )
}