import React, { useRef, useEffect, useCallback, useState } from 'react'
import { prefersReducedMotion } from '../../utils/webgl'

/**
 * Ultra-Smooth 3D Tilt Card dengan Zero-Scroll-Jank Optimization
 * - Menghentikan perhitungan saat scrolling aktif
 * - Caching getBoundingClientRect pada mouseenter (mencegah layout thrashing)
 * - will-change: transform hanya aktif saat kartu di-hover (mencegah layer explosion)
 * - Loop RAF berhenti total saat kartu idle / tidak di-hover
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  perspective = 900,
  scale = 1.015,
  glare = true,
  lerpFactor = 0.09
}) {
  const cardRef = useRef(null)
  const glareRef = useRef(null)
  const rafId = useRef(null)
  const isHovered = useRef(false)
  const cardRect = useRef(null)
  const isScrollingRef = useRef(false)
  const isReduced = prefersReducedMotion()

  const motionState = useRef({
    targetRotX: 0,
    targetRotY: 0,
    targetScale: 1,
    currentRotX: 0,
    currentRotY: 0,
    currentScale: 1,
    glareX: 50,
    glareY: 50,
    currentGlareX: 50,
    currentGlareY: 50,
    targetGlareOpacity: 0,
    currentGlareOpacity: 0
  })

  // Global Scroll Detection untuk membekukan tilt saat scroll
  useEffect(() => {
    let scrollTimer = null
    const handleScroll = () => {
      isScrollingRef.current = true
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        isScrollingRef.current = false
      }, 80)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimer)
    }
  }, [])

  const lerp = (start, end, factor) => start + (end - start) * factor

  const updateLoop = useCallback(() => {
    // Jika sedang scroll aktif, jangan ubah transform
    if (isScrollingRef.current && !isHovered.current) {
      rafId.current = null
      return
    }

    const s = motionState.current
    const factor = lerpFactor

    s.currentRotX = lerp(s.currentRotX, s.targetRotX, factor)
    s.currentRotY = lerp(s.currentRotY, s.targetRotY, factor)
    s.currentScale = lerp(s.currentScale, s.targetScale, factor)

    if (glare) {
      s.currentGlareX = lerp(s.currentGlareX, s.glareX, factor)
      s.currentGlareY = lerp(s.currentGlareY, s.glareY, factor)
      s.currentGlareOpacity = lerp(s.currentGlareOpacity, s.targetGlareOpacity, factor * 1.5)
    }

    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${s.currentRotX.toFixed(2)}deg) rotateY(${s.currentRotY.toFixed(2)}deg) scale3d(${s.currentScale.toFixed(3)}, ${s.currentScale.toFixed(3)}, ${s.currentScale.toFixed(3)}) translate3d(0,0,0)`
    }

    if (glareRef.current && glare) {
      glareRef.current.style.opacity = s.currentGlareOpacity.toFixed(2)
      glareRef.current.style.background = `radial-gradient(circle at ${s.currentGlareX.toFixed(0)}% ${s.currentGlareY.toFixed(0)}%, rgba(243, 197, 181, 0.25) 0%, rgba(183, 110, 121, 0.06) 50%, transparent 75%)`
    }

    const deltaX = Math.abs(s.targetRotX - s.currentRotX)
    const deltaY = Math.abs(s.targetRotY - s.currentRotY)

    if (isHovered.current || deltaX > 0.02 || deltaY > 0.02) {
      rafId.current = requestAnimationFrame(updateLoop)
    } else {
      // Kembali ke posisi diam sempurna dan release GPU layer
      s.currentRotX = 0
      s.currentRotY = 0
      s.currentScale = 1
      s.currentGlareOpacity = 0
      if (cardRef.current) {
        cardRef.current.style.transform = ''
        cardRef.current.style.willChange = 'auto'
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = '0'
      }
      rafId.current = null
    }
  }, [perspective, glare, lerpFactor])

  const handleMouseEnter = useCallback(() => {
    if (isReduced || isScrollingRef.current) return
    isHovered.current = true

    // Cache rect sekali saat mouse enter (hindari layout thrashing di mousemove)
    if (cardRef.current) {
      cardRect.current = cardRef.current.getBoundingClientRect()
      cardRef.current.style.willChange = 'transform'
    }

    motionState.current.targetScale = scale
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateLoop)
    }
  }, [isReduced, scale, updateLoop])

  const handleMouseMove = useCallback((e) => {
    if (isReduced || isScrollingRef.current || !cardRef.current) return

    // Gunakan cached rect atau ambil jika belum ada
    let rect = cardRect.current
    if (!rect) {
      rect = cardRef.current.getBoundingClientRect()
      cardRect.current = rect
    }

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const percentX = (x - centerX) / centerX
    const percentY = (y - centerY) / centerY

    const s = motionState.current
    s.targetRotX = -percentY * maxTilt
    s.targetRotY = percentX * maxTilt
    s.targetScale = scale

    if (glare) {
      s.glareX = (x / rect.width) * 100
      s.glareY = (y / rect.height) * 100
      s.targetGlareOpacity = 0.35
    }

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateLoop)
    }
  }, [isReduced, maxTilt, scale, glare, updateLoop])

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false
    cardRect.current = null

    const s = motionState.current
    s.targetRotX = 0
    s.targetRotY = 0
    s.targetScale = 1
    s.targetGlareOpacity = 0

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateLoop)
    }
  }, [updateLoop])

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {/* Konten Kartu */}
      {children}

      {/* Specular Glare Ringan */}
      {glare && !isReduced && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden pointer-events-none"
          style={{ opacity: 0 }}
        />
      )}
    </div>
  )
}
