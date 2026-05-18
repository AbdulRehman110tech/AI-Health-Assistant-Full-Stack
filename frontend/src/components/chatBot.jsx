// ============================================================
// src/components/ChatBot.jsx
// Floating AI Healthcare Assistant
// Globally visible across all dashboard pages via MainLayout
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import api from '../api/axios'

// ============================================================
// SINGLE MESSAGE BUBBLE
// ============================================================
function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '12px',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        flexShrink: 0,
        background: isUser
          ? 'rgba(0,212,255,0.15)'
          : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,135,0.2))',
        border: isUser
          ? '1px solid rgba(0,212,255,0.3)'
          : '1px solid rgba(0,255,135,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser
          ? <User size={13} color="#00D4FF" />
          : <Bot  size={13} color="#00FF87" />
        }
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'rgba(0,212,255,0.12)'
          : 'rgba(255,255,255,0.05)',
        border: isUser
          ? '1px solid rgba(0,212,255,0.2)'
          : '1px solid rgba(255,255,255,0.08)',
        fontSize: '13px',
        color: '#F0F4FF',
        lineHeight: 1.55,
        wordBreak: 'break-word',
      }}>
        {message.content}
      </div>
    </motion.div>
  )
}

// ============================================================
// TYPING INDICATOR
// ============================================================
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,135,0.2))',
        border: '1px solid rgba(0,255,135,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Bot size={13} color="#00FF87" />
      </div>
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px 16px 16px 4px',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
            style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF87', opacity: 0.7 }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MAIN CHATBOT COMPONENT
// ============================================================
export default function ChatBot() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [messages, setMessages] = useState([
    {
      role:    'assistant',
      content: "Hi! I'm your HealthAI Assistant 👋 Ask me anything about health, symptoms, or medical topics. I'm here to help!",
    }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await api.post('/api/v1/chatbot/chat', { message: userMessage })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch (err) {
      const msg = err.response?.data?.detail?.message || 'Sorry, I could not respond. Please try again.'
      setError(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ' + msg }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── FLOATING ORB BUTTON ───────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position:     'fixed',
          bottom:       '28px',
          right:        '28px',
          zIndex:       1000,
          width:        '56px',
          height:       '56px',
          borderRadius: '50%',
          border:       'none',
          background:   'linear-gradient(135deg, #00D4FF, #00FF87)',
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          boxShadow:    '0 0 0 0 rgba(0,212,255,0.4)',
        }}
        animate={{
          boxShadow: isOpen
            ? '0 8px 32px rgba(0,212,255,0.4)'
            : ['0 0 0 0 rgba(0,212,255,0.4)', '0 0 0 12px rgba(0,212,255,0)', '0 0 0 0 rgba(0,212,255,0)'],
        }}
        transition={{
          boxShadow: isOpen ? {} : { duration: 2, repeat: Infinity, ease: 'easeOut' }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.div key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} color="#080B12" strokeWidth={2.5} />
              </motion.div>
            : <motion.div key="bot" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sparkles size={22} color="#080B12" strokeWidth={2.5} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* ── CHAT PANEL ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.85,  y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position:     'fixed',
              bottom:       '96px',
              right:        '28px',
              zIndex:       999,
              width:        '360px',
              height:       '520px',
              borderRadius: '20px',
              background:   'rgba(8,11,18,0.97)',
              border:       '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow:    '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.1)',
              display:      'flex',
              flexDirection:'column',
              overflow:     'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding:      '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background:   'rgba(255,255,255,0.02)',
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              flexShrink:   0,
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,135,0.2))',
                border: '1px solid rgba(0,212,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={18} color="#00D4FF" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F0F4FF', fontFamily: 'Syne, sans-serif' }}>
                  HealthAI Assistant
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 6px rgba(0,255,135,0.7)' }} />
                  <span style={{ fontSize: '11px', color: '#8B95A8' }}>Online · Powered by Gemini</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', display: 'flex', padding: '4px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F0F4FF'}
                onMouseLeave={e => e.currentTarget.style.color = '#4A5568'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Disclaimer */}
            <div style={{
              padding: '6px 16px',
              display: 'flex', alignItems: 'center', gap: '6px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <AlertCircle size={10} color="#4A5568" />
              <span style={{ fontSize: '10px', color: '#4A5568', lineHeight: 1.4 }}>
                Not a substitute for professional medical advice.
              </span>
            </div>

            {/* Input */}
            <div style={{
              padding:      '12px 16px 16px',
              borderTop:    '1px solid rgba(255,255,255,0.07)',
              display:      'flex',
              gap:          '8px',
              alignItems:   'flex-end',
              flexShrink:   0,
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a health question…"
                rows={1}
                style={{
                  flex:       1,
                  padding:    '10px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color:      '#F0F4FF',
                  fontSize:   '13px',
                  outline:    'none',
                  resize:     'none',
                  maxHeight:  '80px',
                  overflowY:  'auto',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                }}
                onFocus={e  => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: input.trim() && !loading ? 1.08 : 1 }}
                whileTap={{  scale: input.trim() && !loading ? 0.92 : 1 }}
                style={{
                  width:    '40px',
                  height:   '40px',
                  borderRadius: '12px',
                  border:   'none',
                  background: !input.trim() || loading
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #00D4FF, #0099CC)',
                  cursor:   !input.trim() || loading ? 'not-allowed' : 'pointer',
                  display:  'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s ease',
                }}
              >
                {loading
                  ? <Loader2 size={16} color="#8B95A8" style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send    size={16} color={!input.trim() ? '#4A5568' : '#080B12'} strokeWidth={2.5} />
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}