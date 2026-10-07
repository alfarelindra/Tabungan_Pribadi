import React, { useEffect, useRef, useState } from 'react'
import { formatRupiah } from '../../utils/formatters'
import { prefersReducedMotion } from '../../utils/webgl'

/**
 * Animated Number Counter (Rolling Number)
 * Menghitung saldo secara halus (counting up / down)
 * menggunakan kurva fisika deselerasi easeOutExpo saat nilai berubah
 */
export default function NumberCounter({
  value = 0,
  duration = 750, // Durasi transisi (ms)
  className = '',
  formatter = formatRupiah
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  const rafId = useRef(null)
  const isReduced = prefersReducedMotion()

  useEffect(() => {
    const startVal = prevValueRef.current
    const targetVal = Number(value) || 0

    // Jika nilai tidak berubah atau reduced motion aktif, langsung update
    if (startVal === targetVal || isReduced) {
      setDisplayValue(targetVal)
      prevValueRef.current = targetVal
      return
    }

    const diff = targetVal - startVal
    const startTime = performance.now()

    // Fungsi Easing: Ease Out Expo (cepat di awal, melambat sangat halus di akhir)
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

    const animateNumber = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, Math.max(0, elapsed / duration))
      const easedProgress = easeOutExpo(progress)

      const currentComputed = Math.round(startVal + diff * easedProgress)
      setDisplayValue(currentComputed)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animateNumber)
      } else {
        setDisplayValue(targetVal)
        prevValueRef.current = targetVal
        rafId.current = null
      }
    }

    rafId.current = requestAnimationFrame(animateNumber)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [value, duration, isReduced])

  return (
    <span className={`inline-block font-mono tracking-tight will-change-contents ${className}`}>
      {formatter(displayValue)}
    </span>
  )
}
