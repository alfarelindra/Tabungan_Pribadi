import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null

  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'
  const isDelete = toast.type === 'delete'

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-slide-up">
      <div
        className={`flex items-center justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
          isSuccess
            ? 'bg-[#0E1B18]/90 border-emerald-500/30 text-emerald-100 glow-emerald'
            : isDelete
            ? 'bg-[#1C1014]/90 border-[#B76E79]/50 text-[#FFD1DC] glow-rose-gold'
            : isError
            ? 'bg-[#1F0E13]/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
            : 'bg-[#141A28]/90 border-[#E0A96D]/30 text-amber-100 glow-rose-gold'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : isDelete || isError
                ? 'bg-[#B76E79]/20 text-[#F5C2C8]'
                : 'bg-[#E0A96D]/20 text-[#E0A96D]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isError || isDelete ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide">
              {toast.title || (isSuccess ? 'Berhasil' : isDelete ? 'Dihapus' : isError ? 'Perhatian' : 'Informasi')}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-3"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
