import React, { useState, useEffect } from 'react'
import { X, Check, ArrowDownRight, ArrowUpRight, Wallet, AlertCircle } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

export default function GoalFundModal({
  isOpen,
  mode = 'deposit', // 'deposit' | 'withdraw'
  goal = null,
  wallets = [],
  onClose,
  onSubmit
}) {
  const [amount, setAmount] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDeposit = mode === 'deposit'

  useEffect(() => {
    if (wallets.length > 0) {
      setSelectedWalletId(wallets[0].id)
    }
    setAmount('')
    setDate(new Date().toISOString().slice(0, 10))
    setNote('')
    setError('')
  }, [isOpen, wallets, mode])

  if (!isOpen || !goal) return null

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0]
  const numAmount = Number(amount) || 0

  const handleQuickAmount = (val) => {
    setAmount(String(numAmount + val))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!numAmount || numAmount <= 0) {
      setError('Nominal harus lebih dari 0.')
      return
    }

    if (!selectedWalletId) {
      setError('Silakan pilih akun/dompet.')
      return
    }

    if (isDeposit && selectedWallet && numAmount > selectedWallet.currentBalance) {
      setError(`Saldo di ${selectedWallet.name} tidak mencukupi (${formatRupiah(selectedWallet.currentBalance)}).`)
      return
    }

    if (!isDeposit && numAmount > (goal.currentAmount || 0)) {
      setError(`Nominal pencairan melebihi saldo yang terkumpul di tujuan ini (${formatRupiah(goal.currentAmount)}).`)
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        goalId: goal.id,
        amount: numAmount,
        walletId: selectedWalletId,
        date,
        note: note.trim()
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal memproses transaksi dana')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F1420] border border-[#B76E79]/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-[#121927]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              isDeposit ? 'bg-[#E0A96D]/15 text-[#E0A96D]' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {isDeposit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isDeposit ? 'Tambah Dana ke Tujuan' : 'Tarik Dana dari Tujuan'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">
                {goal.name}
              </p>
            </div>
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

          {/* Goal Info Card */}
          <div className="p-3 rounded-xl bg-[#090D14] border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block">Saldo Terkumpul Sekarang:</span>
              <span className="text-sm font-bold text-white font-mono">{formatRupiah(goal.currentAmount)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Target:</span>
              <span className="text-xs font-semibold text-[#E0A96D] font-mono">{formatRupiah(goal.targetAmount)}</span>
            </div>
          </div>

          {/* Pemilihan Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#E0A96D]" />
              <span>{isDeposit ? 'Pilih Dompet Sumber (Uang Diambil Dari) *' : 'Pilih Dompet Penerima (Uang Masuk Ke) *'}</span>
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — Sisa: {formatRupiah(w.currentBalance)}
                </option>
              ))}
            </select>
            {isDeposit && selectedWallet && (
              <p className="text-[11px] text-slate-400 mt-1">
                Saldo dompet ini akan otomatis berkurang sesuai nominal yang dialokasikan.
              </p>
            )}
          </div>

          {/* Input Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Nominal Uang (IDR) *</span>
              {amount && (
                <span className="text-rose-gold-gradient font-mono text-xs font-bold">
                  {formatRupiah(amount)}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#E0A96D]">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                required
                min="1"
              />
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 mr-1">Cepat:</span>
              {[100000, 250000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2 py-0.5 rounded-md bg-[#161D2C] hover:bg-[#20293D] border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-[#E0A96D] transition-colors"
                >
                  +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Opsional
              </label>
              <input
                type="text"
                placeholder={isDeposit ? 'Contoh: Tabungan dari sisa gaji' : 'Contoh: Tarik untuk DP'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-rose-gold-gradient bg-rose-gold-gradient-hover text-slate-950 font-bold text-xs shadow-lg glow-rose-gold active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Memproses...' : isDeposit ? 'Alokasikan Dana' : 'Cairkan Dana'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
