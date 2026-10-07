import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { formatRupiah, formatDateIndo } from '../utils/formatters'

export default function DeleteConfirmModal({
  isOpen,
  transaction,
  onClose,
  onConfirm
}) {
  if (!isOpen || !transaction) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F1420] border border-rose-500/30 rounded-2xl shadow-2xl p-6 overflow-hidden animate-slide-up">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Hapus Transaksi?
            </h3>
            <p className="text-xs text-slate-400">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        {/* Transaction Summary Preview */}
        <div className="p-3.5 rounded-xl bg-[#090D14] border border-slate-800 text-xs space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Kategori:</span>
            <span className="font-semibold text-white">{transaction.category}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Nominal:</span>
            <span className={`font-mono font-bold ${
              transaction.type === 'income' ? 'text-emerald-400' : 'text-[#F5C2C8]'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tanggal:</span>
            <span className="text-slate-300">{formatDateIndo(transaction.date)}</span>
          </div>
          {transaction.note && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Catatan:</span>
              <span className="text-slate-300 italic truncate max-w-[200px]">{transaction.note}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-white/5 text-slate-300 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(transaction.id)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Permanen</span>
          </button>
        </div>

      </div>
    </div>
  )
}
