import React, { useState, useEffect } from 'react'
import { X, Check, Target, Calendar, Tag, Palette } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

const GOAL_CATEGORIES = [
  'Keamanan Finansial',
  'Gadget & Elektronik',
  'Traveling & Liburan',
  'Investasi & Bisnis',
  'Kendaraan',
  'Tempat Tinggal',
  'Pendidikan',
  'Lainnya'
]

const COLOR_OPTIONS = [
  { label: 'Rose Gold', value: 'from-[#F3C5B5] via-[#B76E79] to-[#8E434D]' },
  { label: 'Emerald Green', value: 'from-emerald-500 via-teal-600 to-cyan-700' },
  { label: 'Sapphire Blue', value: 'from-blue-600 via-indigo-600 to-blue-800' },
  { label: 'Sunset Orange', value: 'from-orange-500 via-amber-600 to-rose-600' },
  { label: 'Royal Purple', value: 'from-purple-600 via-pink-600 to-indigo-800' }
]

export default function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const isEdit = Boolean(initialData)

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [targetDate, setTargetDate] = useState('')
  const [category, setCategory] = useState(GOAL_CATEGORIES[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setTargetAmount(initialData.targetAmount ? String(initialData.targetAmount) : '')
      setCurrentAmount(initialData.currentAmount !== undefined ? String(initialData.currentAmount) : '0')
      setTargetDate(initialData.targetDate || '')
      setCategory(initialData.category || GOAL_CATEGORIES[0])
      setColor(initialData.color || COLOR_OPTIONS[0].value)
      setNotes(initialData.notes || '')
    } else {
      setName('')
      setTargetAmount('')
      setCurrentAmount('0')
      setTargetDate('')
      setCategory(GOAL_CATEGORIES[0])
      setColor(COLOR_OPTIONS[0].value)
      setNotes('')
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nama tujuan finansial wajib diisi.')
      return
    }

    const numTarget = Number(targetAmount)
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Target nominal harus lebih dari 0.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        targetAmount: numTarget,
        currentAmount: Number(currentAmount) || 0,
        targetDate,
        category,
        color,
        notes: notes.trim()
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan tujuan finansial')
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
            <div className="p-2 rounded-xl bg-[#E0A96D]/15 text-[#E0A96D]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? 'Ubah Tujuan Finansial' : 'Tujuan Finansial Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tentukan target nominal dan tanggal tercapainya impian Anda
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Nama Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Tujuan Finansial *
            </label>
            <input
              type="text"
              placeholder="Contoh: Dana Darurat, Beli Laptop, Liburan ke Jepang"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              required
            />
          </div>

          {/* Target Nominal & Saldo Terkumpul Awal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Target Nominal (IDR) *</span>
                {targetAmount && (
                  <span className="text-rose-gold-gradient font-mono text-xs font-bold">
                    {formatRupiah(targetAmount)}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#E0A96D]">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Saldo Terkumpul Sekarang (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#E0A96D]">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Tanggal Target & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Tanggal Tercapai
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori Tujuan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Catatan / Motivasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Motivasi Opsional
            </label>
            <input
              type="text"
              placeholder="Contoh: Untuk cadangan biaya hidup jika terjadi situasi darurat"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090D14] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#E0A96D]"
            />
          </div>

          {/* Pilihan Warna */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Tema Warna Kartu</span>
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
              <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Target'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
