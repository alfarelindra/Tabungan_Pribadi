import React from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'

/**
 * 3D Glass Cylinder Vault Indicator (Tabung Kristal 3D)
 * dengan Spring Physics Animasi Pengisian Cairan Cahaya Rose Gold
 * - Sedikit melampaui batas (overshoot) lalu kembali ke posisi persentase tepat secara fisika
 * - Kedalaman bayangan isometrik, efek refleksi kaca buram, partikel kilau emas rose
 */
export default function GoalProgressVault3D({
  percentage = 0,
  currentAmount = 0,
  targetAmount = 0,
  isCompleted = false
}) {
  const clampedPercent = Math.min(100, Math.max(0, percentage))
  // Tinggi cairan di dalam tabung kaca (dari 6% minimum sampai 100%)
  const liquidHeight = Math.max(6, clampedPercent)

  return (
    <div className="relative py-2 select-none group">
      {/* Container Silinder Kaca 3D */}
      <div className="flex items-center gap-4">
        
        {/* Tabung Silinder Isometrik Kaca 3D */}
        <div className="relative w-12 h-24 rounded-2xl p-1 bg-gradient-to-b from-[#1C2538] via-[#0F1422] to-[#0A0D15] border border-[#E0A96D]/30 shadow-2xl shadow-black/80 flex flex-col justify-end overflow-hidden group-hover:border-[#E0A96D]/60 transition-colors">
          
          {/* Cincin Tutup Atas Silinder (Metallic Cap) */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#994D58] via-[#F3C5B5] to-[#B76E79] rounded-t-xl z-20 opacity-80 shadow-sm"></div>

          {/* Refleksi Kilau Kaca Vertikal (Glass Specular Highlight) */}
          <div className="absolute inset-y-0 left-2 w-1.5 bg-gradient-to-r from-white/25 to-transparent rounded-full z-20 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-2 w-1 bg-gradient-to-l from-white/10 to-transparent rounded-full z-20 pointer-events-none"></div>

          {/* Cairan Cahaya 3D Rose Gold (Liquid Chamber) dengan Spring Physics Overshoot */}
          <motion.div
            initial={{ height: '6%' }}
            animate={{ height: `${liquidHeight}%` }}
            transition={{
              type: 'spring',
              stiffness: 85,
              damping: 12,
              mass: 0.85
            }}
            className={`w-full rounded-b-xl relative z-10 will-change-transform ${
              isCompleted
                ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-t from-[#8E434D] via-[#B76E79] to-[#F3C5B5] shadow-[0_0_20px_rgba(224,169,109,0.35)]'
            }`}
          >
            {/* Permukaan Cairan Melengkung (Meniscus 3D) */}
            <div className={`absolute -top-1.5 left-0 right-0 h-3 rounded-[50%] z-15 ${
              isCompleted
                ? 'bg-emerald-300/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-[#FFE2D9] shadow-[0_0_10px_rgba(243,197,181,0.9)]'
            }`}></div>

            {/* Partikel Gelembung Kilau Mikro */}
            <div className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-white/70 animate-ping"></div>
            <div className="absolute bottom-3 right-2 w-1 h-1 rounded-full bg-white/50 animate-pulse"></div>
          </motion.div>

          {/* Garis Skala Pengukur Kapasitas (Measurement Ticks) */}
          <div className="absolute inset-y-3 right-1.5 flex flex-col justify-between z-20 pointer-events-none opacity-40">
            <span className="w-1.5 h-[1px] bg-slate-400"></span>
            <span className="w-1 h-[1px] bg-slate-400"></span>
            <span className="w-1.5 h-[1px] bg-slate-400"></span>
            <span className="w-1 h-[1px] bg-slate-400"></span>
            <span className="w-1.5 h-[1px] bg-slate-400"></span>
          </div>

          {/* Cincin Kaki Bawah Silinder (Metallic Base) */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#994D58] via-[#B76E79] to-[#8E434D] rounded-b-xl z-20"></div>
        </div>

        {/* Informasi Detail Tingkat Pengisian */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Kapasitas Brankas
            </span>
            <span className={`text-xs font-extrabold font-mono flex items-center gap-1 ${
              isCompleted ? 'text-emerald-400' : 'text-rose-gold-gradient'
            }`}>
              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-400" />}
              <span>{clampedPercent}%</span>
            </span>
          </div>

          {/* Batang Rel Indikator Sekunder dengan efek Spring Glow */}
          <div className="w-full h-2 rounded-full bg-[#080C14] border border-slate-800/80 overflow-hidden p-[1px] relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedPercent}%` }}
              transition={{
                type: 'spring',
                stiffness: 90,
                damping: 14,
                mass: 0.8
              }}
              className={`h-full rounded-full will-change-transform ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
                  : 'bg-gradient-to-r from-[#8E434D] via-[#B76E79] to-[#F3C5B5]'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Tersimpan:</span>
            <span className="font-mono text-slate-200 font-medium">
              {Math.max(0, targetAmount - currentAmount) > 0 ? (
                <>Kurang {clampedPercent < 100 ? `${100 - clampedPercent}%` : '0%'}</>
              ) : (
                <span className="text-emerald-400 font-semibold">Tercapai Penuh ✨</span>
              )}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
