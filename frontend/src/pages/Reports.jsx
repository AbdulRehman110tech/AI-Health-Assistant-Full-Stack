// ============================================================
// src/pages/Reports.jsx
// Phase 3F — Medical Reports UI
//
// API used:
//   POST /api/v1/reports/upload       multipart/form-data, field: file
//   GET  /api/v1/reports/             → { reports: [{id, file_name, file_type, uploaded_at}] }
//   GET  /api/v1/reports/{report_id}  → file download (FileResponse)
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Download, AlertCircle,
  CheckCircle2, Loader2, File, FileImage,
  Trash2, CloudUpload, FolderOpen,
} from 'lucide-react'
import api from '../api/axios'

// ─── Helpers ───────────────────────────────────────────────

const ALLOWED_TYPES = ['pdf', 'png', 'jpg', 'jpeg']

const FILE_ICONS = {
  pdf:  { icon: FileText,  color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)',  border: 'rgba(255,107,107,0.2)'  },
  png:  { icon: FileImage, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  jpg:  { icon: FileImage, color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)'  },
  jpeg: { icon: FileImage, color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)'  },
}

const getFileStyle = (type) =>
  FILE_ICONS[type?.toLowerCase()] || {
    icon: File, color: '#00D4FF',
    bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)',
  }

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Animation Variants ────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.3, ease: 'easeOut' } },
}

// ============================================================
// UPLOAD ZONE
// ============================================================

function UploadZone({ onUpload, uploading, uploadSuccess, uploadError }) {
  const inputRef        = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [localError, setLocalError]     = useState(null)

  const validateAndSet = (file) => {
    setLocalError(null)
    const ext = file.name.rsplit
      ? file.name.rsplit('.', 1)
      : file.name.split('.').pop().toLowerCase()
    const fileExt = typeof ext === 'string' ? ext : file.name.split('.').pop().toLowerCase()

    if (!ALLOWED_TYPES.includes(fileExt)) {
      setLocalError(`File type ".${fileExt}" is not supported. Allowed: PDF, PNG, JPG, JPEG.`)
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSet(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
  }

  const handleSubmit = () => {
    if (!selectedFile || uploading) return
    onUpload(selectedFile, () => setSelectedFile(null))
  }

  // Reset local file after success
  useEffect(() => {
    if (uploadSuccess) setSelectedFile(null)
  }, [uploadSuccess])

  const fileStyle = selectedFile
    ? getFileStyle(selectedFile.name.split('.').pop().toLowerCase())
    : null

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', padding: '24px',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#8B95A8', marginBottom: '16px',
      }}>
        Upload Report
      </div>

      {/* Drop zone */}
      <motion.div
        animate={{
          borderColor: dragging
            ? 'rgba(0,212,255,0.6)'
            : selectedFile
            ? `${fileStyle.color}55`
            : 'rgba(255,255,255,0.1)',
          background: dragging
            ? 'rgba(0,212,255,0.06)'
            : 'rgba(255,255,255,0.02)',
        }}
        transition={{ duration: 0.2 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        style={{
          border: '2px dashed rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '32px 20px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '12px', cursor: selectedFile ? 'default' : 'pointer',
          marginBottom: '14px', transition: 'background 0.2s',
          minHeight: '140px', textAlign: 'center',
        }}
      >
        {selectedFile ? (
          // File preview
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: fileStyle.bg, border: `1px solid ${fileStyle.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <fileStyle.icon size={22} color={fileStyle.color} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 3px' }}>
                {selectedFile.name}
              </p>
              <p style={{ fontSize: '11px', color: '#8B95A8', margin: 0 }}>
                {formatBytes(selectedFile.size)} · {selectedFile.name.split('.').pop().toUpperCase()}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setLocalError(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#F87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Trash2 size={12} /> Remove
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              animate={{ y: dragging ? -4 : 0 }}
              style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: dragging ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${dragging ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CloudUpload size={22} color={dragging ? '#00D4FF' : '#8B95A8'} />
            </motion.div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 4px' }}>
                {dragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
              </p>
              <p style={{ fontSize: '11px', color: '#8B95A8', margin: 0 }}>
                Supports PDF, PNG, JPG, JPEG
              </p>
            </div>
          </>
        )}
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {/* Local validation error */}
      <AnimatePresence>
        {localError && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" exit="hidden"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '12px',
            }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            {localError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload error from API */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" exit="hidden"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '12px',
            }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" exit="hidden"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
              background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)',
              color: '#00FF87', fontSize: '12px', fontWeight: 600,
            }}
          >
            <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
            Report uploaded successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <motion.button
        whileHover={{ scale: selectedFile && !uploading ? 1.02 : 1 }}
        whileTap={{  scale: selectedFile && !uploading ? 0.98 : 1 }}
        onClick={handleSubmit}
        disabled={!selectedFile || uploading}
        style={{
          width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
          background: selectedFile && !uploading
            ? 'linear-gradient(135deg, #0099CC, #0066FF)'
            : 'rgba(255,255,255,0.05)',
          color: selectedFile ? '#F0F4FF' : '#8B95A8',
          fontSize: '14px', fontWeight: 700,
          cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: selectedFile && !uploading ? '0 8px 24px rgba(0,153,204,0.25)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {uploading ? (
          <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</>
        ) : (
          <><Upload size={15} /> Upload Report</>
        )}
      </motion.button>
    </div>
  )
}

// ============================================================
// REPORT CARD
// ============================================================

function ReportCard({ report, onDownload, downloading }) {
  const style = getFileStyle(report.file_type)
  const IconComponent = style.icon

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -3, boxShadow: `0 8px 32px ${style.bg}` }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '16px',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center',
        gap: '14px', transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* File icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '11px', flexShrink: 0,
        background: style.bg, border: `1px solid ${style.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconComponent size={20} color={style.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px', fontWeight: 600, color: '#F0F4FF',
          margin: '0 0 4px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {report.file_name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 8px',
            borderRadius: '99px', textTransform: 'uppercase',
            background: style.bg, border: `1px solid ${style.border}`,
            color: style.color,
          }}>
            {report.file_type}
          </span>
          <span style={{ fontSize: '11px', color: '#8B95A8' }}>
            {formatDate(report.uploaded_at)}
          </span>
        </div>
      </div>

      {/* Download button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onDownload(report)}
        disabled={downloading === report.id}
        style={{
          flexShrink: 0,
          width: '36px', height: '36px', borderRadius: '10px',
          background: style.bg, border: `1px solid ${style.border}`,
          color: style.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: downloading === report.id ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        title={`Download ${report.file_name}`}
      >
        {downloading === report.id
          ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
          : <Download size={15} />
        }
      </motion.button>
    </motion.div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Reports() {
  // Reports list
  const [reports, setReports]       = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError]   = useState(null)

  // Upload
  const [uploading, setUploading]       = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError]   = useState(null)

  // Download
  const [downloading, setDownloading] = useState(null) // report id being downloaded

  // ── Fetch reports on mount ────────────────────────────────
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setListLoading(true)
      setListError(null)
      const res = await api.get('/api/v1/reports/')
      setReports(res.data.reports || [])
    } catch {
      setListError('Failed to load reports. Please refresh.')
    } finally {
      setListLoading(false)
    }
  }

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async (file, onSuccess) => {
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/api/v1/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadSuccess(true)
      onSuccess?.()
      // Refresh list
      await fetchReports()
      // Auto-clear success after 3s
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      const msg =
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        'Upload failed. Please try again.'
      setUploadError(typeof msg === 'string' ? msg : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // ── Download ──────────────────────────────────────────────
  const handleDownload = async (report) => {
    setDownloading(report.id)
    try {
      const res = await api.get(`/api/v1/reports/${report.id}`, {
        responseType: 'blob',
      })
      // Create a temporary anchor to trigger browser download
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', report.file_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // Silent fail — could show a toast here if needed
    } finally {
      setDownloading(null)
    }
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
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={20} color="#A78BFA" />
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: '28px',
            fontWeight: 800, color: '#F0F4FF', margin: 0,
          }}>
            Medical Reports
          </h1>
        </div>
        <p style={{ color: '#8B95A8', fontSize: '14px', margin: 0, paddingLeft: '4px' }}>
          Upload and manage your medical documents securely.
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
        gap: '20px', alignItems: 'start',
      }}>

        {/* ═══ LEFT — Upload ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <UploadZone
            onUpload={handleUpload}
            uploading={uploading}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
          />
        </motion.div>

        {/* ═══ RIGHT — Reports List ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '24px',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* List header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '16px',
          }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#8B95A8',
            }}>
              My Reports
            </span>
            {!listLoading && !listError && (
              <span style={{ fontSize: '12px', color: '#8B95A8' }}>
                {reports.length} file{reports.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List error */}
          {listError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '13px',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {listError}
            </div>
          )}

          {/* Loading skeleton */}
          {listLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '12px', width: '60%', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', marginBottom: '8px' }} />
                    <div style={{ height: '10px', width: '40%', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!listLoading && !listError && reports.length === 0 && (
            <motion.div
              variants={fadeUp} initial="hidden" animate="show"
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '12px', padding: '40px 20px', textAlign: 'center',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <FolderOpen size={26} color="rgba(139,149,168,0.35)" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(240,244,255,0.3)', margin: '0 0 4px' }}>
                  No reports yet
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(139,149,168,0.4)', margin: 0 }}>
                  Upload your first medical document above.
                </p>
              </div>
            </motion.div>
          )}

          {/* Report cards */}
          {!listLoading && !listError && reports.length > 0 && (
            <motion.div
              initial="hidden" animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {reports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDownload={handleDownload}
                  downloading={downloading}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  )
}