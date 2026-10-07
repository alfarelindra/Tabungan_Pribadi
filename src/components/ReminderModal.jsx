import React, { useState, useEffect } from 'react'
import { X, Check, Bell, Calendar, CreditCard, DollarSign } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

export default function ReminderModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  wallets = []
}) {
  const isEdit = Boolean(initialData)

  const [kind, setKind] = useState('bill') // 'bill' | 'loan'
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('Bulanan')
  const [dueDate, setDueDate] = useState('')
  const [borrowDate, setBorrowDate] = useState('')
  const [loanType, setLoanType] = useState('debt') // 'debt' | 'receivable'
  const [walletId, setWalletId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultWalletId = wallets[0]?.id || ''

  useEffect(() => {
    if (initialData) {
      setKind(initialData.kind || 'bill')
      setName(initialData.name || '')
      setAmount(initialData.amount ? String(initialData.amount) : '')
      setFrequency(initialData.frequency || 'Bulanan')
      setDueDate(initialData.dueDate || '')
      setBorrowDate(initialData.borrowDate || '')
      setLoanType(initialData.loanType || 'debt')
      setWalletId(initialData.walletId || defaultWalletId)
      setNotes(initialData.notes || '')
    } else {
      setKind('bill')
      setName('')
      setAmount('')
      setFrequency('Bulanan')
      setDueDate(new Date().toISOString().slice(0, 10))
      setBorrowDate(new Date().toISOString().slice(0, 10))
      setLoanType('debt')
      setWalletId(defaultWalletId)
      setNotes('')
    }
    setError('')
  }, [initialData, isOpen, defaultWalletId])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nama tagihan atau nama pihak pinjaman wajib diisi.')
      return
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus lebih dari 0.')
      return
    }

    if (!dueDate) {
      setError('Tanggal jatuh tempo wajib diisi.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        id: initialData?.id,
        kind,
        name: name.trim(),
        amount: numAmount,
        frequency: kind === 'bill' ? frequency : undefined,
        dueDate,
        borrowDate: kind === 'loan' ? borrowDate : undefined,
        loanType: kind === 'loan' ? loanType : undefined,
        walletId,
        notes: notes.trim()
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengingat')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F1420] border border-[#B76E79]/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-[#121927]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 text-[#F5C2C8]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? 'Ubah Pengingat' : 'Pengingat Tagihan & Pinjaman Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pastikan tagihan rutin dan tempo pinjaman terpantau tepat waktu
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Segmented Type Toggle: Tagihan Rutin vs Pinjaman */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#090D14] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setKind('bill')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                kind === 'bill'
                  ? 'bg-rose-gold-gradient text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tagihan Rutin
            </button>
            <button
              type="button"
              onClick={() => setKind('loan')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                kind === 'loan'
                  ? 'bg-rose-gold-gradient text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pinjaman / Hutang
            </button>
          </div>

          {/* Loan Sub-type (Hutang vs Piutang) */}
          {kind === 'loan' && (
            <div className="grid grid-cols-2 gap-2 p-2 bg-[#0C101A] rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="radio"
                  name="loanType"
                  value="debt"
                  checked={loanType === 'debt'}
                  onChange={() => setLoanType('debt')}
                  className="accent-[#B76E79]"
                />
                <span>Hutang (Saya Meminjam)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="radio"
                  name="loanType"
                  value="receivable"
                  checked={loanType === 'receivable'}
                  onChange={() => setLoanType('receivable')}
                  className="accent-emerald-400"
                />
                <span>Piutang (Orang Pinjam ke Saya)</span>
              </label>
            </div>
          )}

          {/* Nama Tagihan / Peminjam */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {kind === 'bill' ? 'Nama Tagihan / Langganan *' : 'Nama Pihak Peminjam / Pemberi Pinjaman *'}
            </label>
            <input
              type="text"
              placeholder={kind === 'bill' ? 'Contoh: Langganan Replit, Listrik PLN, WiFi' : 'Contoh: Cicilan Usaha Pak Budi, Talangan Dimas'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              required
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Nominal Kewajiban (IDR) *</span>
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
          </div>

          {/* Frekuensi (Jika Tagihan) */}
          {kind === 'bill' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Frekuensi Siklus Tagihan
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              >
                <option value="Bulanan">Bulanan (Monthly)</option>
                <option value="Tahunan">Tahunan (Yearly)</option>
                <option value="Mingguan">Mingguan (Weekly)</option>
                <option value="Satu Kali">Satu Kali Saja</option>
              </select>
            </div>
          )}

          {/* Tanggal Peminjaman Awal & Jatuh Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kind === 'loan' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tanggal Peminjaman Awal *
                </label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                  required
                />
              </div>
            )}

            <div className={kind === 'bill' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Jatuh Tempo Pembayaran *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                required
              />
            </div>
          </div>

          {/* Dompet Terkait */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#E0A96D]" />
              <span>Dompet Pembayaran Default</span>
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatRupiah(w.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Tambahan Opsional
            </label>
            <input
              type="text"
              placeholder="Contoh: Pembayaran melalui auto-debit atau transfer ATM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
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
              className="px-5 py-2.5 rounded-xl bg-rose-gold-gradient bg-rose-gold-gradient-hover text-slate-950 font-bold text-xs shadow-lg glow-rose-gold active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Pengingat'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
