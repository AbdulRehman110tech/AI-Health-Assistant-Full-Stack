import { motion } from 'framer-motion'
export default function History() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', color: '#F0F4FF', marginBottom: '8px' }}>History</h1>
      <p style={{ color: '#8B95A8' }}>Your prediction history will appear here.</p>
    </motion.div>
  )
}