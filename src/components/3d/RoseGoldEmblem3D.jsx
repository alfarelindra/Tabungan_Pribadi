import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { isWebGLAvailable, prefersReducedMotion } from '../../utils/webgl'
import { Sparkles } from 'lucide-react'

export default function RoseGoldEmblem3D({
  size = 105,
  className = ''
}) {
  const mountRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const supported = isWebGLAvailable()
    const reduced = prefersReducedMotion()

    if (!supported || reduced) {
      setHasWebGL(false)
      setIsReady(true)
      return
    }

    let isMounted = true
    let animationFrameId = null
    let renderer = null
    let scene = null
    let camera = null
    let coinMesh = null
    let isScrolling = false
    let scrollTimeout = null

    let targetRotX = 0
    let targetRotY = 0

    // Jeda render saat scrolling aktif agar scroll 100% lancar
    const handleScroll = () => {
      isScrolling = true
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrolling = false
      }, 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    const initTimer = setTimeout(() => {
      if (!isMounted || !mountRef.current) return

      try {
        const width = size
        const height = size

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50)
        camera.position.z = 4.2

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power'
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(1.0) // Kunci 1.0 agar sangat hemat GPU saat compositing
        mountRef.current.appendChild(renderer.domElement)

        // Low-Poly Cylinder (24 segmen)
        const coinGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.22, 24)
        const roseGoldMaterial = new THREE.MeshStandardMaterial({
          color: 0xE0A96D,
          roughness: 0.3,
          metalness: 0.85
        })

        coinMesh = new THREE.Mesh(coinGeometry, roseGoldMaterial)
        coinMesh.rotation.x = Math.PI / 2
        scene.add(coinMesh)

        // Torus Ring Tengah
        const innerGeometry = new THREE.TorusGeometry(0.7, 0.08, 10, 20)
        const innerMaterial = new THREE.MeshStandardMaterial({
          color: 0xFAD6CD,
          roughness: 0.25,
          metalness: 0.92
        })
        const innerStarMesh = new THREE.Mesh(innerGeometry, innerMaterial)
        innerStarMesh.position.z = 0.02
        coinMesh.add(innerStarMesh)

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.3)
        scene.add(ambientLight)

        const dirLight = new THREE.DirectionalLight(0xFAD6CD, 2.2)
        dirLight.position.set(3, 4, 3)
        scene.add(dirLight)

        const rimLight = new THREE.DirectionalLight(0xB76E79, 1.8)
        rimLight.position.set(-3, -2, -2)
        scene.add(rimLight)

        // Hanya listen mousemove LOKAL pada elemen emblem (bukan seluruh window)
        const domEl = mountRef.current
        const handleLocalMouseMove = (e) => {
          const rect = domEl.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5
          targetRotY = x * 1.8
          targetRotX = -y * 1.8
        }
        const handleLocalMouseLeave = () => {
          targetRotY = 0
          targetRotX = 0
        }

        domEl.addEventListener('mousemove', handleLocalMouseMove, { passive: true })
        domEl.addEventListener('mouseleave', handleLocalMouseLeave, { passive: true })

        // Intersection Observer: Stop loop jika off-screen
        let isVisible = true
        const observer = new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting
        }, { threshold: 0.05 })

        observer.observe(domEl)

        let clock = new THREE.Clock()
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate)

          // Jangan render jika off-screen, tab hidden, atau sedang scroll aktif
          if (!isVisible || document.hidden || isScrolling) return

          const delta = clock.getDelta()
          
          if (coinMesh) {
            coinMesh.rotation.z += delta * 0.7
            coinMesh.rotation.y += (targetRotY - coinMesh.rotation.y) * 0.08
            coinMesh.rotation.x += (Math.PI / 2 + targetRotX - coinMesh.rotation.x) * 0.08
            coinMesh.position.y = Math.sin(clock.getElapsedTime() * 1.8) * 0.06
          }

          renderer.render(scene, camera)
        }

        animate()
        setIsReady(true)

        return () => {
          domEl.removeEventListener('mousemove', handleLocalMouseMove)
          domEl.removeEventListener('mouseleave', handleLocalMouseLeave)
          observer.disconnect()
        }
      } catch (err) {
        console.warn('Gagal memuat WebGL emblem:', err)
        setHasWebGL(false)
        setIsReady(true)
      }
    }, 60)

    return () => {
      isMounted = false
      clearTimeout(initTimer)
      clearTimeout(scrollTimeout)
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (renderer && renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
        renderer.dispose()
      }
    }
  }, [size])

  if (!hasWebGL) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center p-2 ${className}`}
        title="Astaron Wealth Emblem"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#8E434D] via-[#B76E79] to-[#F3C5B5] p-[2px] shadow-lg shadow-[#B76E79]/20">
          <div className="w-full h-full rounded-full bg-[#0F1420] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#E0A96D]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center transition-opacity duration-300 ${
        isReady ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      aria-label="Ornamen 3D Astaron Rose Gold Coin"
    />
  )
}
