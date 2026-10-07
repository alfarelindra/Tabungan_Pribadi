import React, { useState, useEffect } from 'react'
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, DollarSign, Calendar, Tag, FileText, Check, CreditCard } from 'lucide-react'
import { CATEGORIES, formatRupiah } from '../utils/formatters'

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  wallets = []
}) {
  const isEdit = Boolean(initialData)

  const [type, setType] = useState('expense') // 'expense' | 'income' | 'transfer'
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [walletId, setWalletId] = useState('')
  const [fromWalletId, setFromWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default wallet fallbacks
  const firstWalletId = wallets[0]?.id || ''
  const secondWalletId = wallets[1]?.id || firstWalletId

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense')
      setAmount(initialData.amount ? String(initialData.amount) : '')
      setCategory(initialData.category || '')
      setDate(initialData.date || new Date().toISOString().slice(0, 10))
      setNote(initialData.note || '')
      setWalletId(initialData.walletId || firstWalletId)
      setFromWalletId(initialData.fromWalletId || firstWalletId)
      setToWalletId(initialData.toWalletId || secondWalletId)
    } else {
      setType('expense')
      setAmount('')
      setCategory('Makanan')
      setDate(new Date().toISOString().slice(0, 10))
      setNote('')
      setWalletId(firstWalletId)
      setFromWalletId(firstWalletId)
      setToWalletId(secondWalletId)
    }
    setError('')
  }, [initialData, isOpen, firstWalletId, secondWalletId])

  if (!isOpen) return null

  const availableCategories = CATEGORIES[type === 'transfer' ? 'expense' : type] || []

  const handleQuickAmount = (val) => {
    const current = Number(amount) || 0
    setAmount(String(current + val))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Nominal harus lebih dari 0.')
      return
    }

    if (type === 'transfer') {
      if (!fromWalletId || !toWalletId) {
        setError('Pilih dompet asal dan dompet tujuan.')
        return
      }
      if (fromWalletId === toWalletId) {
        setError('Dompet asal dan tujuan tidak boleh sama.')
        return
      }
    } else {
      if (!walletId) {
        setError('Silakan pilih salah satu dompet/akun.')
        return
      }
      if (!category.trim()) {
        setError('Silakan pilih salah satu kategori.')
        return
      }
    }

    if (!date) {
      setError('Tanggal transaksi wajib dipilih.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        id: initialData?.id,
        type,
        amount: numAmount,
        category: type === 'transfer' ? (category || 'Transfer Antar Akun') : category.trim(),
        date,
        note: note.trim(),
        walletId: type !== 'transfer' ? walletId : undefined,
        fromWalletId: type === 'transfer' ? fromWalletId : undefined,
        toWalletId: type === 'transfer' ? toWalletId : undefined
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan transaksi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F1420] border border-[#B76E79]/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-[#121927]">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {isEdit ? 'Perbarui Transaksi' : 'Catat Transaksi Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? 'Ubah informasi detail transaksi ini' : 'Tambahkan catatan arus kas ke dompet/akun Anda'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Toggle Jenis (Pengeluaran / Pemasukan / Transfer) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#090D14] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense')
                if (!CATEGORIES.expense.some(c => c.name === category)) {
                  setCategory('Makanan')
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Pengeluaran</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income')
                if (!CATEGORIES.income.some(c => c.name === category)) {
                  setCategory('Gaji')
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemasukan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('transfer')
                setCategory('Transfer Antar Akun')
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'transfer'
                  ? 'bg-gradient-to-r from-[#B76E79]/30 to-[#E0A96D]/30 text-[#E0A96D] border border-[#E0A96D]/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#E0A96D]" />
              <span>Transfer</span>
            </button>
          </div>

          {/* 2. Pemilihan Dompet (Sumber/Tujuan Dana) */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#090D14] rounded-xl border border-[#E0A96D]/20">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dari Dompet (Asal) *
                </label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121826] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#E0A96D]"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ke Dompet (Tujuan) *
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121826] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#E0A96D]"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#E0A96D]" />
                <span>
                  {type === 'expense' ? 'Sumber Dana (Uang Keluar Dari) *' : 'Tujuan Dana (Uang Masuk Ke) *'}
                </span>
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — Sisa: {formatRupiah(w.currentBalance)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Nominal Uang */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Nominal Uang (IDR) *</span>
              {amount && (
                <span className="text-rose-gold-gradient font-mono font-bold text-xs">
                  {formatRupiah(amount)}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-[#E0A96D]">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-base font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D] transition-all"
                required
                min="1"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 mr-1">Cepat:</span>
              {[50000, 100000, 250000, 500000, 1000000].map((val) => (
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

          {/* 4. Kategori (Hanya jika bukan transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori Transaksi *
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-[#090D14] rounded-xl border border-slate-800">
                {availableCategories.map((cat) => {
                  const isSelected = category === cat.name
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                        isSelected
                          ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-md'
                          : 'bg-[#121826] text-slate-300 hover:bg-[#1B2336] hover:text-white border border-transparent'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 5. Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Opsional
              </label>
              <input
                type="text"
                placeholder={type === 'transfer' ? 'Contoh: Top up saldo GoPay...' : 'Contoh: Belanja bulanan...'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={80}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
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
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : isEdit
                  ? 'Simpan Perubahan'
                  : type === 'transfer'
                  ? 'Transfer Dana'
                  : 'Catat Transaksi'}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
