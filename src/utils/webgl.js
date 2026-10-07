/**
 * Deteksi dukungan WebGL pada perangkat klien
 * untuk memastikan Graceful Degradation jika perangkat low-end / WebGL tidak aktif.
 */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

/**
 * Deteksi preferensi reduced motion dari pengguna
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
