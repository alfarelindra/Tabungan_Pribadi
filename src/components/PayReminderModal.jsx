import React, { useState, useEffect } from 'react'
import { X, Check, CreditCard, AlertCircle, Calendar } from 'lucide-react'
import { formatRupiah, formatDateIndo } from '../utils/formatters'

export default function PayReminderModal({
  isOpen,
  reminder = null,
  wallets = [],
  onClose,
  onConfirm
}) {
  const [walletId, setWalletId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isReceivable = reminder?.kind === 'loan' && reminder?.loanType === 'receivable'

  useEffect(() => {
    if (reminder) {
      setWalletId(reminder.walletId || wallets[0]?.id || '')
      setDate(new Date().toISOString().slice(0, 10))
      setNote(isReceivable ? `Penerimaan pelunasan: ${reminder.name}` : `Pembayaran: ${reminder.name}`)
    }
    setError('')
  }, [reminder, wallets, isOpen, isReceivable])

  if (!isOpen || !reminder) return null

  const selectedWallet = wallets.find(w => w.id === walletId) || wallets[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!walletId) {
      setError('Silakan pilih akun/dompet.')
      return
    }

    if (!isReceivable && selectedWallet && reminder.amount > selectedWallet.currentBalance) {
      setError(`Saldo di ${selectedWallet.name} tidak mencukupi (${formatRupiah(selectedWallet.currentBalance)}).`)
      return
    }

    try {
      setIsSubmitting(true)
      await onConfirm({
        reminderId: reminder.id,
        walletId,
        date,
        note: note.trim()
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal memproses pembayaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F1420] border border-[#B76E79]/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-[#121927]">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isReceivable ? 'Konfirmasi Pelunasan Piutang' : 'Konfirmasi Pembayaran Tagihan'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isReceivable ? 'Catat uang masuk ke dompet Anda' : 'Otomatis catat pengeluaran & potong saldo dompet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reminder Preview Card */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Deskripsi:</span>
              <span className="font-bold text-white">{reminder.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nominal:</span>
              <span className="font-mono font-extrabold text-base text-rose-gold-gradient">
                {formatRupiah(reminder.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Jatuh Tempo:</span>
              <span className="text-slate-300 font-medium">{formatDateIndo(reminder.dueDate)}</span>
            </div>
          </div>

          {/* Pilih Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#E0A96D]" />
              <span>{isReceivable ? 'Masuk ke Dompet' : 'Potong dari Dompet *'}</span>
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — Saldo: {formatRupiah(w.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tanggal Pembayaran
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Transaksi
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Memproses...' : isReceivable ? 'Terima Pelunasan' : 'Konfirmasi Pembayaran'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
