import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Pill, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Loader2,
  FileText,
  Activity,
  CheckCircle,
  Hourglass,
  X
} from 'lucide-react'
import api from '../api/axios'

// Advanced UI Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
  exit: { opacity: 0, scale: 0.95, height: 0, overflow: 'hidden', margin: 0, padding: 0, transition: { duration: 0.2 } }
}

export default function Reminders() {
  // --------------------------------------------------------
  // PRESERVED LOGIC & STATE (UNTOUCHED CORE)
  // --------------------------------------------------------
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '',
    reminder_time: '',
    notes: ''
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const getMinDateTimeString = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  const fetchReminders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/api/v1/reminders/')
      if (response.data && response.data.status === 'success') {
        setReminders(response.data.reminders || [])
      }
    } catch (err) {
      const msg = err.response?.data?.detail?.message || 'Failed to fetch medical schedules.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formError) setFormError(null)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const chosenTime = new Date(formData.reminder_time)
    if (chosenTime <= new Date()) {
      setFormError('Schedules must be placed in a future timestamp.')
      return
    }

    try {
      setFormSubmitting(true)
      setFormError(null)
      const response = await api.post('/api/v1/reminders/', formData)
      if (response.data && response.data.status === 'success') {
        setFormData({ medicine_name: '', dosage: '', reminder_time: '', notes: '' })
        fetchReminders()
        setIsModalOpen(false) 
      }
    } catch (err) {
      const msg = err.response?.data?.detail?.message || 'Could not save schedule. Check inputs.'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleToggleComplete = async (id) => {
    try {
      const response = await api.patch(`/api/v1/reminders/${id}/toggle`)
      if (response.data && response.data.status === 'success') {
        setReminders(prev => 
          prev.map(item => item.id === id ? { ...item, is_completed: response.data.is_completed } : item)
        )
      }
    } catch (err) {
      setError('Failed to update compliance status.')
    }
  }

  const handleDeleteReminder = async (id) => {
    try {
      const response = await api.delete(`/api/v1/reminders/${id}`)
      if (response.data && response.data.status === 'success') {
        setReminders(prev => prev.filter(item => item.id !== id))
      }
    } catch (err) {
      setError('Could not remove scheduling entry.')
    }
  }

  const formatDateTimeText = (isoString) => {
    if (!isoString) return { date: '', time: '' }
    const d = new Date(isoString)
    const dateFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return { date: dateFormatted, time: timeFormatted }
  }

  // --------------------------------------------------------
  // CLIENT-SIDE DERIVED STATS & SORTING
  // --------------------------------------------------------
  const totalCount = reminders.length
  const completedCount = reminders.filter(r => r.is_completed).length
  const pendingCount = totalCount - completedCount

  const activeReminders = reminders
    .filter(r => !r.is_completed)
    .sort((a, b) => new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime())

  const completedReminders = reminders
    .filter(r => r.is_completed)
    .sort((a, b) => new Date(b.reminder_time).getTime() - new Date(a.reminder_time).getTime())

  return (
    <div className="p-6 lg:p-10 min-h-screen text-[#F0F4FF] relative overflow-hidden selection:bg-cyan-500/30">
      
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />

      {/* Top Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/5 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center">
              <Bell size={20} className="text-[#00D4FF]" />
            </div>
            <div>
              <h1 className="font-['Syne'] text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
                Treatment Schedules
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#8B95A8] pl-1 font-medium">
            Monitor patient pill loops, dosage matrices, and programmatic compliance timelines.
          </p>
        </motion.div>

        {/* Premium Add Button - INCREASED Y-AXIS PADDING */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          onClick={() => setIsModalOpen(true)}
          className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-white font-bold text-sm tracking-wide py-4 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={16} className="text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Reminder</span>
        </motion.button>
      </div>

      {/* Cyber Analytics Stats Overlay Grid */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 relative z-10"
      >
        <motion.div variants={itemVariants} className="bg-slate-900/20 border border-white/[0.05] backdrop-blur-xl rounded-2xl p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] flex items-center justify-between group hover:border-white/10 transition-colors duration-300">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#8B95A8] uppercase mb-1">Active Trackers</p>
            <h3 className="font-['Syne'] text-2xl font-bold text-white tracking-tight">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-all duration-300">
            <Activity size={16} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/20 border border-white/[0.05] backdrop-blur-xl rounded-2xl p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] flex items-center justify-between group hover:border-white/10 transition-colors duration-300">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#8B95A8] uppercase mb-1">Pending Intakes</p>
            <h3 className="font-['Syne'] text-2xl font-bold text-[#00D4FF] tracking-tight">{pendingCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-[#00D4FF] transition-all duration-300">
            <Hourglass size={16} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/20 border border-white/[0.05] backdrop-blur-xl rounded-2xl p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] flex items-center justify-between group hover:border-white/10 transition-colors duration-300">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#8B95A8] uppercase mb-1">Adherence Success</p>
            <h3 className="font-['Syne'] text-2xl font-bold text-emerald-400 tracking-tight">{completedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 transition-all duration-300">
            <CheckCircle size={16} />
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm mb-6">
            <AlertCircle size={16} className="text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32 bg-[#0d1527]/10 border border-white/[0.03] rounded-2xl backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
              <Activity size={16} className="absolute text-cyan-400 animate-pulse" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#8B95A8] animate-pulse">
              Syncing Chrono Registry...
            </span>
          </div>
        ) : reminders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center gap-5 py-24 px-6 bg-[#0d1527]/20 border border-white/[0.04] rounded-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03),transparent_70%)] pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-slate-500/40">
              <Pill size={24} />
            </div>
            <div>
              <h3 className="font-['Syne'] font-bold text-base text-white/60 mb-1">Timeline Stream Clear</h3>
              <p className="text-xs text-[#8B95A8] max-w-xs mx-auto leading-relaxed font-normal">
                No prescription structures mapped to this profile. Formulate a routine cycle to begin tracking.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold flex items-center gap-1.5 py-2 transition-colors"
            >
              <Plus size={14} /> Add First Reminder
            </button>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {activeReminders.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#8B95A8] mb-5 pl-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  Upcoming Intakes
                </h3>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {activeReminders.map((item) => (
                      <ReminderCard 
                        key={item.id} 
                        item={item} 
                        formatDateTimeText={formatDateTimeText} 
                        onToggle={() => handleToggleComplete(item.id)} 
                        onDelete={() => handleDeleteReminder(item.id)} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {completedReminders.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-5 pl-1 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Completed History
                </h3>
                <div className="space-y-4 opacity-70 hover:opacity-100 transition-opacity duration-300">
                  <AnimatePresence mode="popLayout">
                    {completedReminders.map((item) => (
                      <ReminderCard 
                        key={item.id} 
                        item={item} 
                        formatDateTimeText={formatDateTimeText} 
                        onToggle={() => handleToggleComplete(item.id)} 
                        onDelete={() => handleDeleteReminder(item.id)} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Reminder Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)} 
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} 
              className="w-full max-w-md bg-[#0d1527]/90 border border-white/10 shadow-2xl backdrop-blur-2xl rounded-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              <div className="p-7">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Plus size={18} className="text-[#00D4FF]" />
                    <h2 className="font-['Syne'] font-bold text-lg text-white tracking-wide">New Schedule</h2>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* INCREASED Y-AXIS PADDING ON INPUTS (py-3.5) */}
                  <div className="relative group/field">
                    <label className="block text-[10px] font-bold text-[#8B95A8] tracking-widest uppercase mb-2 group-focus-within/field:text-cyan-400 transition-colors">
                      Medicine Designation
                    </label>
                    <div className="relative">
                      <input 
                        type="text" name="medicine_name" required value={formData.medicine_name} onChange={handleInputChange}
                        placeholder="e.g., Amoxicillin Complex"
                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-4 pr-10 py-3.5 text-sm text-[#F0F4FF] placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-black/60 transition-all duration-300"
                      />
                      <Pill size={16} className="absolute right-4 top-3.5 text-white/10 group-focus-within/field:text-cyan-500/40 transition-colors" />
                    </div>
                  </div>

                  <div className="relative group/field">
                    <label className="block text-[10px] font-bold text-[#8B95A8] tracking-widest uppercase mb-2 group-focus-within/field:text-cyan-400 transition-colors">
                      Dosage
                    </label>
                    <input 
                      type="text" name="dosage" required value={formData.dosage} onChange={handleInputChange}
                      placeholder="e.g., 250mg — Every 8 Hours"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-[#F0F4FF] placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-black/60 transition-all duration-300"
                    />
                  </div>

                  <div className="relative group/field">
                    <label className="block text-[10px] font-bold text-[#8B95A8] tracking-widest uppercase mb-2 group-focus-within/field:text-cyan-400 transition-colors">
                      Trigger Timestamp
                    </label>
                    <input 
                      type="datetime-local" name="reminder_time" required min={getMinDateTimeString()} value={formData.reminder_time} onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-cyan-500/40 focus:bg-black/60 transition-all duration-300 scheme-dark select-none"
                    />
                  </div>

                  <div className="relative group/field">
                    <label className="block text-[10px] font-bold text-[#8B95A8] tracking-widest uppercase mb-2 group-focus-within/field:text-cyan-400 transition-colors">
                      Directive Notes
                    </label>
                    <textarea 
                      name="notes" rows="3" value={formData.notes} onChange={handleInputChange}
                      placeholder="Optional restrictions..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-[#F0F4FF] placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-black/60 transition-all duration-300 resize-none"
                    />
                  </div>

                  <AnimatePresence>
                    {formError && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 p-3.5 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-medium"
                      >
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span>{formError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-3">
                    {/* INCREASED Y-AXIS PADDING ON SUBMIT BUTTON (py-4) */}
                    <button
                      type="submit" disabled={formSubmitting}
                      className="w-full relative bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {formSubmitting ? <Loader2 size={18} className="animate-spin" /> : <span>Deploy Schedule</span>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --------------------------------------------------------
// COMPACT TASK-STYLE CARD COMPONENT (INCREASED Y-AXIS)
// --------------------------------------------------------
function ReminderCard({ item, formatDateTimeText, onToggle, onDelete }) {
  const { date, time } = formatDateTimeText(item.reminder_time)
  const isCompleted = item.is_completed

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      // INCREASED PADDING (py-5 px-5)
      className={`group relative flex items-center justify-between py-5 px-5 rounded-xl border backdrop-blur-xl transition-all duration-300 ${
        isCompleted 
          ? 'bg-emerald-950/10 border-emerald-500/10' 
          : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        
        {/* Modern Status Toggle - INCREASED SIZE (w-6 h-6) */}
        <button 
          onClick={onToggle}
          className="flex-shrink-0 focus:outline-none"
          title={isCompleted ? "Revert to Pending" : "Mark as Completed"}
        >
          {isCompleted ? (
            <div className="w-6 h-6 rounded border border-emerald-500/50 bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={16} className="stroke-[3px]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded border border-white/20 bg-black/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 flex items-center justify-center text-transparent hover:text-cyan-400/40 transition-all">
              <Circle size={12} className="stroke-[3px]" />
            </div>
          )}
        </button>

        {/* Task Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 sm:gap-6 min-w-0 pr-4">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <h3 className={`font-semibold text-base truncate ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                {item.medicine_name}
              </h3>
              <span className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                isCompleted ? 'bg-slate-800/50 text-slate-500 border-transparent' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}>
                {item.dosage}
              </span>
            </div>
            {item.notes && (
              <p className={`text-sm truncate mt-1.5 ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                <FileText size={12} className="inline mr-1.5 mb-0.5 opacity-50" />
                {item.notes}
              </p>
            )}
          </div>

          {/* Time Block */}
          <div className="flex items-center gap-4 text-sm font-medium flex-shrink-0">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={14} className="opacity-50" />
              <span>{date}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isCompleted ? 'text-slate-500' : 'text-cyan-400 font-bold'}`}>
              <Clock size={14} className="opacity-70" />
              <span>{time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Action - LARGER HIT AREA (p-2.5) */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 p-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
        title="Delete Reminder"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  )
}