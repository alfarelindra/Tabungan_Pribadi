import React, { useState, useEffect } from 'react'
import { X, Check, CreditCard, Building2, Smartphone, Banknote, Palette } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

const COLOR_OPTIONS = [
  { label: 'Rose Gold', value: 'from-[#F3C5B5] via-[#B76E79] to-[#8E434D]' },
  { label: 'Sapphire Blue', value: 'from-blue-600 via-indigo-600 to-blue-800' },
  { label: 'Emerald Green', value: 'from-emerald-500 via-teal-600 to-cyan-700' },
  { label: 'Sunset Orange', value: 'from-orange-500 via-amber-600 to-rose-600' },
  { label: 'Royal Purple', value: 'from-purple-600 via-pink-600 to-indigo-800' }
]

export default function WalletModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const isEdit = Boolean(initialData)

  const [name, setName] = useState('')
  const [type, setType] = useState('ewallet')
  const [accountNumber, setAccountNumber] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setType(initialData.type || 'ewallet')
      setAccountNumber(initialData.accountNumber || '')
      setInitialBalance(initialData.initialBalance !== undefined ? String(initialData.initialBalance) : '0')
      setColor(initialData.color || COLOR_OPTIONS[0].value)
    } else {
      setName('')
      setType('ewallet')
      setAccountNumber('')
      setInitialBalance('0')
      setColor(COLOR_OPTIONS[0].value)
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nama akun/dompet wajib diisi.')
      return
    }

    const numBal = Number(initialBalance)
    if (isNaN(numBal) || numBal < 0) {
      setError('Saldo awal harus berupa angka non-negatif.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        type,
        accountNumber: accountNumber.trim(),
        initialBalance: numBal,
        color
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan akun/dompet')
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
            <div className="p-2 rounded-xl bg-[#E0A96D]/15 text-[#E0A96D]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? 'Ubah Akun / Dompet' : 'Tambah Akun / Dompet Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola rekening bank, e-wallet (DANA, GoPay, ShopeePay), atau tunai
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Tipe Akun (E-Wallet / Bank / Tunai) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipe Tempat Penyimpanan *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('ewallet')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'ewallet'
                    ? 'bg-[#E0A96D]/15 border-[#E0A96D] text-white shadow-sm'
                    : 'bg-[#090D14] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1 text-emerald-400" />
                <span>E-Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setType('bank')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'bank'
                    ? 'bg-[#E0A96D]/15 border-[#E0A96D] text-white shadow-sm'
                    : 'bg-[#090D14] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1 text-blue-400" />
                <span>Bank / ATM</span>
              </button>

              <button
                type="button"
                onClick={() => setType('cash')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'cash'
                    ? 'bg-[#E0A96D]/15 border-[#E0A96D] text-white shadow-sm'
                    : 'bg-[#090D14] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-4 h-4 mb-1 text-[#E0A96D]" />
                <span>Uang Tunai</span>
              </button>
            </div>
          </div>

          {/* Nama Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Akun / Dompet *
            </label>
            <input
              type="text"
              placeholder="Contoh: DANA, ShopeePay, GoPay, BCA, dll"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              required
            />
          </div>

          {/* Nomor Akun / Rekening / No HP */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nomor Akun / No Rekening / No HP (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 0812-xxxx-xxxx atau 8271xxxx"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            />
          </div>

          {/* Saldo Awal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Saldo Awal (IDR) *</span>
              {initialBalance && (
                <span className="text-rose-gold-gradient font-mono text-xs font-bold">
                  {formatRupiah(initialBalance)}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#E0A96D]">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                required
                min="0"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Saldo awal saat akun pertama kali dicatat dalam portofolio Anda.
            </p>
          </div>

          {/* Tema Warna Aksen */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Aksen Warna Kartu</span>
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-r ${c.value} transition-transform ${
                    color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0F1420] scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
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
              <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Dompet'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
