import { Outlet } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AuthLayout() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20, mass: 0.8 })
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20, mass: 0.8 })
  
  const [isMobile, setIsMobile] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const particleCount = window.innerWidth < 768 ? 15 : 30 // Slightly more particles for density
    const newParticles = Array.from({ length: particleCount }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 1 + 0.5, // Slightly larger base scale
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15
    }))
    setParticles(newParticles)

    const handleMouseMove = (e) => {
      if (window.innerWidth >= 768) {
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', 
      background: '#080B12', // Strict requirement: Maintained original dark background
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* =========================================
          BACKGROUND LAYER (Strictly z-index: 0)
          ========================================= */}
      
      {/* 1. Original Ambient Blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0,255,135,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />

      {/* 2. Cursor Reactive Spotlight (Desktop Only) */}
      {!isMobile && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0, left: 0,
            x: springX,
            y: springY,
            width: '600px', // Strict requirement: Radius kept the same
            height: '600px',
            marginLeft: '-300px', 
            marginTop: '-300px',
            // Bright Light Blue Glow Effect
            background: 'radial-gradient(circle, rgba(135,206,250,0.3) 0%, rgba(0,212,255,0.15) 35%, transparent 70%)',
            filter: 'blur(20px)', // Softens the bright gradient into a premium bloom
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {/* 3. Floating Antigravity Particles (Bright White Spots) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: p.top, 
              left: p.left, 
              opacity: 0, 
              scale: p.scale 
            }}
            animate={{
              y: [0, -80], 
              x: [0, (Math.random() - 0.5) * 40],
              // Much higher opacity peak (50% to 100%) for high visibility
              opacity: [0, Math.random() * 0.5 + 0.5, 0] 
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '4px', // Slightly larger base size
              height: '4px',
              borderRadius: '50%',
              background: '#FFFFFF', // Pure White
              // Intense double-layered white glow
              boxShadow: '0 0 15px rgba(255,255,255,1), 0 0 5px rgba(255,255,255,0.8)',
            }}
          />
        ))}
      </div>

      {/* =========================================
          FOREGROUND LAYER (Strictly z-index: 1)
          ========================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
      >
        <Outlet />
      </motion.div>
    </div>
  )
}