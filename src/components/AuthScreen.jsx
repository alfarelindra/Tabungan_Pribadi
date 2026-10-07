import React, { useState } from 'react'
import { Sparkles, Lock, Mail, Key, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import TiltCard from './3d/TiltCard'
import RoseGoldEmblem3D from './3d/RoseGoldEmblem3D'
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured, saveSupabaseAnonKey } from '../services/supabase'

export default function AuthScreen({ onAuthSuccess, onContinueDemo }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [inlineKey, setInlineKey] = useState('')

  const hasConfig = isSupabaseConfigured()

  const handleSaveInlineKey = (e) => {
    e.preventDefault()
    if (!inlineKey.trim()) return
    saveSupabaseAnonKey(inlineKey.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email || !password) {
      setErrorMsg('Harap isi email dan kata sandi Anda.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.')
      return
    }

    try {
      setIsLoading(true)
      if (mode === 'signin') {
        const { user } = await signInWithEmail(email, password)
        if (user) {
          onAuthSuccess(user)
        }
      } else {
        const data = await signUpWithEmail(email, password)
        // Jika Supabase tidak mewajibkan konfirmasi email, session langsung aktif
        if (data?.session && data?.user) {
          onAuthSuccess(data.user)
          return
        }
        
        // Jika konfirmasi email diwajibkan
        setSuccessMsg(
          'Pendaftaran berhasil! Supabase telah mengirim email verifikasi. Buka email Anda dan klik link konfirmasi, atau matikan "Confirm email" di dashboard Supabase.'
        )
        setMode('signin')
      }
    } catch (err) {
      console.error('Auth error:', err)
      let msg = err.message || 'Gagal melakukan autentikasi.'
      if (msg.includes('Email not confirmed')) {
        msg = 'Email belum diverifikasi. Buka inbox/spam email Anda dan klik link konfirmasi, atau konfirmasi langsung di dashboard Supabase (Authentication -> Users).'
      } else if (msg.includes('Invalid login credentials')) {
        msg = 'Email atau kata sandi salah. Jika baru mendaftar, pastikan email sudah diverifikasi.'
      }
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#080B11] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[radial-gradient(circle,rgba(224,169,109,0.08),transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[radial-gradient(circle,rgba(183,110,121,0.08),transparent_70%)] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <TiltCard maxTilt={6} perspective={1000} scale={1.01} glare={true}>
          <div className="glass-card-interactive relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-[#E0A96D]/30 shadow-2xl shadow-black/80">
            
            {/* Header: 3D Emblem & Brand */}
            <div className="text-center space-y-3 mb-6">
              <div className="flex justify-center">
                <div className="p-2 rounded-2xl bg-[#090D15] border border-[#E0A96D]/30 shadow-inner inline-block">
                  <RoseGoldEmblem3D size={95} />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Private Access &bull; Supabase RLS</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Astaron <span className="text-rose-gold-gradient">Finance</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Pencatat Keuangan Pribadi & Wealth Intelligence Terenkripsi
                </p>
              </div>
            </div>

            {/* Konfigurasi Supabase Anon Key */}
            {!hasConfig && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Kunci Supabase Anon Belum Diatur</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Tempelkan <strong>Anon Key</strong> dari proyek Supabase Anda di bawah ini, atau masukkan ke file <code className="px-1 py-0.5 rounded bg-black/40 text-[#E0A96D]">.env</code>:
                </p>

                <form onSubmit={handleSaveInlineKey} className="space-y-2">
                  <div className="relative">
                    <input
                      type="password"
                      value={inlineKey}
                      onChange={(e) => setInlineKey(e.target.value)}
                      placeholder="Tempel Supabase Anon Key di sini (eyJhb...)"
                      className="w-full py-2 px-3 text-xs rounded-xl bg-black/60 border border-amber-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!inlineKey.trim()}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 hover:text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Hubungkan Database
                    </button>
                    <a
                      href="https://supabase.com/dashboard/project/uvdxsxajeslfmfgtkknv/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-[#090D15] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all inline-block text-center"
                    >
                      Buka Supabase ↗
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* Tab Mode: Masuk / Daftar */}
            <div className="flex items-center p-1 bg-[#090D15] rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-rose-gold-gradient text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk (Sign In)
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-rose-gold-gradient text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {/* Form Autentikasi */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0A0E18] border border-slate-800 focus:border-[#E0A96D] focus:ring-1 focus:ring-[#E0A96D] rounded-xl text-white text-xs placeholder:text-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Field Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0A0E18] border border-slate-800 focus:border-[#E0A96D] focus:ring-1 focus:ring-[#E0A96D] rounded-xl text-white text-xs placeholder:text-slate-600 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Notifikasi Pesan Error / Sukses */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span className="leading-relaxed">{errorMsg}</span>
                    </div>
                    {errorMsg.includes('verifikasi') && (
                      <div className="pt-1 border-t border-rose-500/20 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Atau konfirmasi instan di:</span>
                        <a
                          href="https://supabase.com/dashboard/project/uvdxsxajeslfmfgtkknv/auth/users"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#E0A96D] hover:underline"
                        >
                          Supabase Users ↗
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-rose-gold-gradient hover:bg-rose-gold-gradient-hover text-slate-950 font-bold text-xs shadow-lg glow-rose-gold active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Buka Dashboard Finansial' : 'Buat Akun Pribadi'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Notice & Demo Option */}
            <div className="mt-6 pt-5 border-t border-slate-800/60 text-center space-y-3">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-[#E0A96D]" />
                <span>Data dienkripsi dan diproteksi penuh oleh Row Level Security</span>
              </p>

              {onContinueDemo && (
                <button
                  type="button"
                  onClick={onContinueDemo}
                  className="text-[11px] text-[#E0A96D]/80 hover:text-[#E0A96D] underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Atau lanjutkan dalam mode offline / demo lokal
                </button>
              )}
            </div>

          </div>
        </TiltCard>
      </motion.div>
    </div>
  )
}
