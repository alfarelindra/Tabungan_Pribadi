import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Lock, Fingerprint, Eye, EyeOff, CheckCircle2, AlertCircle, Shield, X } from "lucide-react"

const PIN_KEY = "astaron_app_pin_hash"
const LOCK_KEY = "astaron_app_locked"

function simpleHash(pin) {
  // Basic obfuscation - NOT cryptographically secure
  // For production, use bcrypt or server-side auth
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    hash = ((hash << 5) - hash + pin.charCodeAt(i)) | 0
  }
  return String(hash)
}

export function useAppLock() {
  const hasPin = () => !!localStorage.getItem(PIN_KEY)
  const isLocked = () => localStorage.getItem(LOCK_KEY) === "1"
  const lock = () => localStorage.setItem(LOCK_KEY, "1")
  const unlock = () => localStorage.removeItem(LOCK_KEY)
  const setPin = (pin) => localStorage.setItem(PIN_KEY, simpleHash(pin))
  const clearPin = () => { localStorage.removeItem(PIN_KEY); unlock() }
  const verifyPin = (pin) => localStorage.getItem(PIN_KEY) === simpleHash(pin)
  return { hasPin, isLocked, lock, unlock, setPin, clearPin, verifyPin }
}

function PinInput({ value, onChange, onComplete, label, error }) {
  const digits = value.split("")
  return (
    <div>
      {label && <div className="text-xs text-slate-400 text-center mb-3 font-semibold">{label}</div>}
      <div className="flex gap-2 justify-center mb-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={"w-10 h-12 rounded-xl border flex items-center justify-center text-xl font-bold transition-all " + (digits[i] ? "bg-[#E0A96D]/10 border-[#E0A96D]/50 text-[#E0A96D]" : "bg-[#0B0F19] border-slate-700 text-slate-600")}>
            {digits[i] ? "•" : "–"}
          </div>
        ))}
      </div>
      {error && <div className="text-xs text-rose-400 text-center mb-2">{error}</div>}
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((key, idx) => (
          <button key={idx} disabled={key === ""}
            onClick={() => {
              if (key === "⌫") { onChange(value.slice(0,-1)); return }
              if (key === "") return
              const newVal = (value + key).slice(0,6)
              onChange(newVal)
              if (newVal.length === 6 && onComplete) onComplete(newVal)
            }}
            className={"h-12 rounded-xl text-sm font-bold transition-all cursor-pointer " + (key === "⌫" ? "bg-[#131A2B] text-rose-400 border border-slate-700 hover:border-rose-500/30" : key === "" ? "invisible" : "bg-[#131A2B] border border-slate-700 text-white hover:border-[#E0A96D]/30 hover:bg-[#1A2235]")}>
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AppLockScreen({ onUnlock }) {
  const { verifyPin } = useAppLock()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isShaking, setIsShaking] = useState(false)

  const handleComplete = (val) => {
    if (verifyPin(val)) {
      onUnlock()
    } else {
      setError("PIN salah. Coba lagi.")
      setIsShaking(true)
      setTimeout(() => { setPin(""); setError(""); setIsShaking(false) }, 700)
    }
  }

  const tryWebAuthn = async () => {
    try {
      // WebAuthn / Biometric check
      if (!window.PublicKeyCredential) { setError("Biometrik tidak didukung browser ini."); return }
      await navigator.credentials.get({ publicKey: { challenge: new Uint8Array(32), rpId: window.location.hostname, userVerification: "required" } })
      onUnlock()
    } catch (e) {
      setError("Autentikasi biometrik gagal atau dibatalkan.")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#080B11] flex flex-col items-center justify-center p-6 select-none">
      <div className="fixed top-1/4 left-1/3 w-80 h-80 bg-rose-600/8 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.5 }}
        className="w-full max-w-xs flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E0A96D]/20 to-[#B76E79]/30 border border-[#E0A96D]/30 flex items-center justify-center">
          <Shield className="w-8 h-8 text-[#E0A96D]" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-white">App Terkunci</h1>
          <p className="text-xs text-slate-500 mt-1">Masukkan PIN 6 digit untuk melanjutkan</p>
        </div>
        <div className="w-full">
          <PinInput value={pin} onChange={setPin} onComplete={handleComplete} error={error} />
        </div>
        <button onClick={tryWebAuthn} className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#E0A96D] transition-colors cursor-pointer">
          <Fingerprint className="w-4 h-4" /> Gunakan Biometrik / Fingerprint
        </button>
      </motion.div>
    </div>
  )
}

export function AppLockSetupModal({ isOpen, onClose }) {
  const { hasPin, setPin: savePin, clearPin, verifyPin } = useAppLock()
  const [step, setStep] = useState(hasPin() ? "manage" : "set") // set | confirm | manage | change
  const [pin1, setPin1] = useState("")
  const [pin2, setPin2] = useState("")
  const [currentPin, setCurrentPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSetPin = (val) => {
    if (val.length === 6) {
      setPin1(val)
      setStep("confirm")
    }
  }

  const handleConfirm = (val) => {
    if (val === pin1) {
      savePin(val)
      setSuccess("PIN berhasil diatur! App Lock aktif.")
      setStep("manage")
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError("PIN tidak cocok. Ulangi dari awal.")
      setPin1(""); setPin2(""); setStep("set")
      setTimeout(() => setError(""), 2000)
    }
  }

  const handleClearPin = () => {
    if (!verifyPin(currentPin)) { setError("PIN saat ini salah."); return }
    clearPin()
    setSuccess("PIN berhasil dihapus.")
    setStep("set"); setCurrentPin("")
    setTimeout(() => setSuccess(""), 2000)
  }

  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }} onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-xs flex flex-col bg-[#0D1117] border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E0A96D]/15 border border-[#E0A96D]/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#E0A96D]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">App Lock</h2>
                <p className="text-[10px] text-slate-500">Proteksi PIN 6 digit atau Biometrik</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            {success && <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"><CheckCircle2 className="w-4 h-4" />{success}</div>}
            {error && <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"><AlertCircle className="w-4 h-4" />{error}</div>}
            {step === "set" && (
              <PinInput value={pin1} onChange={setPin1} onComplete={handleSetPin} label="Buat PIN baru (6 digit)" />
            )}
            {step === "confirm" && (
              <PinInput value={pin2} onChange={setPin2} onComplete={handleConfirm} label="Konfirmasi PIN Anda" />
            )}
            {step === "manage" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <Lock className="w-4 h-4" /> App Lock aktif dengan PIN 6 digit
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-2">Masukkan PIN saat ini untuk hapus:</div>
                  <PinInput value={currentPin} onChange={setCurrentPin} onComplete={v => { setCurrentPin(v); handleClearPin() }} />
                </div>
                <button onClick={() => { setStep("set"); setPin1(""); setPin2("") }}
                  className="w-full py-2.5 rounded-xl bg-[#131A2B] border border-slate-700 text-slate-300 text-xs font-semibold hover:border-[#E0A96D]/30 transition-all cursor-pointer">
                  Ganti PIN
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
