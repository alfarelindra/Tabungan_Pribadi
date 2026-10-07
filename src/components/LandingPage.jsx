import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ShieldCheck, Sparkles, TrendingUp, Bell, FileText, Lock, BarChart2, Target, Wallet, ArrowRight, Star, Play, Globe, ChevronDown } from "lucide-react"
import RoseGoldEmblem3D from "./3d/RoseGoldEmblem3D"

const FEATURES = [
  { Icon: TrendingUp, title: "Net Worth Tracker", desc: "Lacak kekayaan bersih real-time: saldo + aset – hutang, multi-currency IDR/USD/SGD.", color: "emerald" },
  { Icon: BarChart2, title: "AI Health Score", desc: "Skor kesehatan keuangan otomatis dengan savings rate, runway indicator, dan insight cerdas.", color: "violet" },
  { Icon: FileText, title: "Import Mutasi Bank", desc: "Paste teks mutasi BCA, Mandiri, e-wallet, atau upload CSV dan petakan otomatis.", color: "blue" },
  { Icon: Target, title: "Tujuan Finansial 3D", desc: "Brankas virtual 3D untuk setiap mimpi finansial Anda dengan visualisasi progress interaktif.", color: "amber" },
  { Icon: Bell, title: "Smart Reminders", desc: "Notifikasi H-3 & H-1 jatuh tempo tagihan, cicilan, dan pinjaman via browser dan WhatsApp.", color: "rose" },
  { Icon: Lock, title: "App Lock & Security", desc: "Proteksi 6-digit PIN atau biometrik WebAuthn (Fingerprint/FaceID) untuk keamanan ekstra.", color: "slate" },
  { Icon: Wallet, title: "Multi-Dompet", desc: "Kelola semua rekening bank, dompet digital, dan tunai dalam satu dashboard elegan.", color: "cyan" },
  { Icon: FileText, title: "Laporan PDF Pro", desc: "Unduh laporan bulanan profesional siap cetak dengan breakdown lengkap arus kas.", color: "pink" },
]

const BADGES = [
  { Icon: ShieldCheck, label: "Supabase RLS Protected", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { Icon: Lock, label: "Client-Side Encryption Ready", color: "text-[#E0A96D] bg-[#E0A96D]/10 border-[#E0A96D]/20" },
  { Icon: Globe, label: "Zero Data Selling", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
]

const STATS = [
  { value: "6+", label: "Modul Finansial" },
  { value: "100%", label: "Privasi Data" },
  { value: "PWA", label: "Install ke Homescreen" },
  { value: "0 Biaya", label: "Demo Gratis Selamanya" },
]

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseInt(target) || 0
    if (!num) return
    let start = 0
    const step = Math.ceil(num / 30)
    const timer = setInterval(() => {
      start = Math.min(start + step, num)
      setCount(start)
      if (start >= num) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [target])
  const num = parseInt(target)
  if (!num) return <span>{target}{suffix}</span>
  return <span>{count}{suffix}</span>
}

export default function LandingPage({ onLogin, onDemo }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-[#B76E79]/12 via-[#E0A96D]/6 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-0 w-96 h-96 bg-gradient-to-tl from-violet-600/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sticky Nav */}
      <header className={"fixed top-0 left-0 right-0 z-40 transition-all duration-300 " + (scrolled ? "bg-[#080B11]/90 backdrop-blur-xl border-b border-slate-800/80 py-3" : "py-5")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 shrink-0"><RoseGoldEmblem3D size={32} /></div>
            <div>
              <span className="text-sm font-black text-white tracking-tight">Astaron</span>
              <span className="text-sm font-black text-rose-gold-gradient ml-1">Finance PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onLogin}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:border-[#E0A96D]/40 hover:text-white transition-all cursor-pointer">
              Masuk / Daftar
            </button>
            <button onClick={onDemo}
              className="px-4 py-2 rounded-xl bg-rose-gold-gradient text-slate-900 text-xs font-black shadow-lg hover:opacity-90 transition-all cursor-pointer hidden sm:block">
              Coba Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }} className="space-y-6">
          {/* Badge row */}
          <div className="flex justify-center gap-2 flex-wrap">
            {BADGES.map(({ Icon, label, color }) => (
              <span key={label} className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold " + color}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </span>
            ))}
          </div>

          {/* 3D Emblem */}
          <div className="flex justify-center">
            <div className="p-4 rounded-3xl bg-[#0B0F19]/80 border border-[#E0A96D]/30 shadow-2xl inline-flex">
              <RoseGoldEmblem3D size={120} />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Kendali Penuh atas<br />
            <span className="text-rose-gold-gradient">Kekayaan Anda</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Astaron Finance PRO — Aplikasi manajemen keuangan pribadi mewah dengan AI Health Score, Net Worth Tracker, Multi-Dompet, dan laporan profesional. Sinkronisasi cloud atau mode offline penuh.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button onClick={onLogin}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-rose-gold-gradient text-slate-900 font-black text-sm shadow-2xl hover:opacity-90 active:scale-95 transition-all cursor-pointer">
              <ArrowRight className="w-4 h-4" /> Masuk / Daftar Gratis
            </button>
            <button onClick={onDemo}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#141B2B] border border-slate-700 hover:border-[#E0A96D]/40 text-white font-bold text-sm transition-all cursor-pointer">
              <Play className="w-4 h-4 text-[#E0A96D]" /> Coba Demo Langsung
            </button>
          </div>
          <p className="text-xs text-slate-600">Tidak perlu kartu kredit. Data 100% privat di akun Anda.</p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="mt-12 flex justify-center text-slate-600">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="py-10 border-y border-slate-800/60 bg-[#0A0D14]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-gold-gradient font-mono">
                <AnimatedCounter target={value} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0A96D]/10 border border-[#E0A96D]/20 text-xs font-bold text-[#E0A96D] mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 8 Modul Finansial Terintegrasi
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Semua yang Anda Butuhkan</h2>
          <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto">Dari pencatatan harian hingga perencanaan kekayaan jangka panjang — semua dalam satu aplikasi yang elegan.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ Icon, title, desc, color }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16,1,0.3,1] }}
              className="glass-card-interactive rounded-2xl p-5 space-y-3">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center bg-" + color + "-500/15 border border-" + color + "-500/25"}>
                <Icon className={"w-5 h-5 text-" + color + "-400"} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-[#0A0D14] to-[#080B11]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-black text-white">Keamanan Adalah Prioritas Kami</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Data Anda dilindungi oleh Supabase Row Level Security (RLS) — setiap baris data hanya dapat diakses oleh pemiliknya. 
            Tidak ada pihak ketiga yang dapat mengakses informasi keuangan Anda. Kami tidak pernah menjual data.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {BADGES.map(({ Icon, label, color }) => (
              <span key={label} className={"inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold " + color}>
                <Icon className="w-4 h-4" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 text-center max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141B2B] via-[#101522] to-[#18121E] border border-[#E0A96D]/25 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,rgba(224,169,109,0.12),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#E0A96D] fill-[#E0A96D]" />)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Mulai Perjalanan Finansial Anda</h2>
            <p className="text-slate-400 text-sm">Daftar gratis dengan Supabase atau langsung coba mode demo tanpa pendaftaran.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={onLogin}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-gold-gradient text-slate-900 font-black text-sm shadow-xl hover:opacity-90 transition-all cursor-pointer">
                <ArrowRight className="w-4 h-4" /> Mulai Sekarang
              </button>
              <button onClick={onDemo}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0B0F19] border border-slate-700 hover:border-[#E0A96D]/40 text-white font-bold text-sm transition-all cursor-pointer">
                <Play className="w-4 h-4 text-[#E0A96D]" /> Demo Tanpa Akun
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#070A0F] py-8 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-400">
            <span className="text-rose-gold-gradient font-bold">Astaron Finance PRO</span>
            <span>•</span>
            <span>Luxury Personal Wealth Intelligence</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Lock className="w-3 h-3 text-[#E0A96D]" />
            <span>Supabase BaaS • RLS Protected • Rose Gold Luxury Edition</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
