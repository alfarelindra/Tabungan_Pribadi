import React, { useState } from 'react'
import { Bell, Plus, CheckCircle2, AlertTriangle, Clock, Calendar, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Layers, CreditCard, Sparkles } from 'lucide-react'
import { formatRupiah, formatDateIndo } from '../utils/formatters'
import TiltCard from './3d/TiltCard'

export default function SmartReminders({
  reminders = [],
  onAddNewReminder,
  onEditReminder,
  onDeleteReminder,
  onPayReminder
}) {
  const [filterType, setFilterType] = useState('unpaid') // 'unpaid' | 'all' | 'bill' | 'loan' | 'paid'

  const filteredReminders = reminders.filter(r => {
    if (filterType === 'unpaid') return !r.isPaid
    if (filterType === 'paid') return r.isPaid
    if (filterType === 'bill') return r.kind === 'bill'
    if (filterType === 'loan') return r.kind === 'loan'
    return true
  })

  // Hitung ringkasan
  const unpaidCount = reminders.filter(r => !r.isPaid).length
  const totalUnpaidAmount = reminders
    .filter(r => !r.isPaid && (r.kind === 'bill' || (r.kind === 'loan' && r.loanType === 'debt')))
    .reduce((acc, r) => acc + r.amount, 0)

  const getStatusBadge = (rem) => {
    if (rem.isPaid) {
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Lunas / Terbayar
        </span>
      )
    }

    switch (rem.status) {
      case 'today':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/40 animate-pulse flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Jatuh Tempo Hari Ini!
          </span>
        )
      case 'overdue':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-600/25 text-red-200 border border-red-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" /> Terlewat {Math.abs(rem.daysLeft)} Hari
          </span>
        )
      case 'urgent':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> {rem.daysLeft} Hari Lagi
          </span>
        )
      case 'upcoming':
      default:
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#E0A96D]" /> {rem.daysLeft} Hari Lagi
          </span>
        )
    }
  }

  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-[#F5C2C8]">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Pengingat Tagihan & Pinjaman</span>
              {unpaidCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unpaidCount} Menunggu
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lapisan kartu 3D terorganisir untuk memantau tanggal jatuh tempo tagihan rutin, pinjaman, dan tanggal peminjaman awal
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {unpaidCount > 0 && (
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 block">Kewajiban Mendatang:</span>
              <span className="text-sm font-bold text-rose-300 font-mono">
                {formatRupiah(totalUnpaidAmount)}
              </span>
            </div>
          )}

          <button
            onClick={onAddNewReminder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-gold-gradient bg-rose-gold-gradient-hover text-slate-950 text-xs font-bold shadow-md glow-rose-gold active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>Tambah Pengingat</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 bg-[#0C101A] p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
        <button
          onClick={() => setFilterType('unpaid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filterType === 'unpaid'
              ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Perlu Dibayar ({unpaidCount})
        </button>
        <button
          onClick={() => setFilterType('bill')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filterType === 'bill'
              ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tagihan Rutin
        </button>
        <button
          onClick={() => setFilterType('loan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filterType === 'loan'
              ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Hutang & Pinjaman
        </button>
        <button
          onClick={() => setFilterType('paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filterType === 'paid'
              ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Riwayat Lunas
        </button>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filterType === 'all'
              ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Semua ({reminders.length})
        </button>
      </div>

      {/* List Item Pengingat dalam Bentuk Layered Cards (Ilusi Kedalaman 3D Z-index) */}
      {filteredReminders.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          Tidak ada pengingat dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {filteredReminders.map((rem, index) => {
            const isBill = rem.kind === 'bill'
            const isLoan = rem.kind === 'loan'
            const isReceivable = isLoan && rem.loanType === 'receivable'

            return (
              <TiltCard
                key={rem.id}
                maxTilt={8}
                perspective={900}
                scale={1.015}
                glare={true}
                className="relative"
              >
                {/* 3D Layered Depth Underlay (Lapisan Belakang Bayangan Isometrik) */}
                <div className="absolute inset-0 translate-y-2 translate-x-1 rounded-2xl bg-gradient-to-r from-slate-950 via-[#120F16] to-[#0A0D15] border border-slate-900/90 -z-10 pointer-events-none opacity-80 transition-all duration-500 group-hover:translate-y-3 group-hover:opacity-60"></div>

                <div
                  className={`relative z-10 p-4.5 rounded-2xl border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.85),0_0_28px_rgba(224,169,109,0.18)] hover:border-[#E0A96D]/55 hover:z-20 will-change-transform will-change-shadow ${
                    rem.isPaid
                      ? 'bg-[#0A0E17]/80 border-slate-800/60 opacity-60'
                      : rem.status === 'today' || rem.status === 'overdue'
                      ? 'bg-gradient-to-br from-[#170C12] via-[#100D16] to-[#0D121F] border-rose-500/40 shadow-rose-950/20'
                      : 'bg-gradient-to-br from-[#111724] via-[#0E131E] to-[#0A0D16] border-slate-800/90 shadow-black/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Badge Jenis & Status */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                          isBill 
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : isReceivable
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isBill ? `Tagihan ${rem.frequency || 'Bulanan'}` : isReceivable ? 'Piutang (Diterima)' : 'Pinjaman / Hutang'}
                        </span>

                        {getStatusBadge(rem)}
                      </div>

                      {/* Nama Tagihan / Peminjam */}
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {rem.name}
                      </h4>

                      {/* Detail Data Pinjaman Wajib: Tanggal Peminjaman Awal & Jatuh Tempo */}
                      <div className="text-[11px] text-slate-400 mt-2 space-y-1 bg-[#090D15]/60 p-2.5 rounded-xl border border-slate-800/60">
                        {isLoan && rem.borrowDate && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Tanggal Pinjam Awal:</span>
                            <span className="font-semibold text-slate-200">{formatDateIndo(rem.borrowDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Jatuh Tempo:</span>
                          <span className="font-semibold text-[#F3C5B5]">{formatDateIndo(rem.dueDate)}</span>
                        </div>
                        {rem.notes && (
                          <p className="text-[11px] text-slate-400 italic pt-0.5 line-clamp-1 border-t border-slate-800/40">
                            &quot;{rem.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nominal & Tombol Aksi "Bayar Sekarang" */}
                    <div className="text-right shrink-0 flex flex-col justify-between items-end">
                      <div>
                        <div className="text-base sm:text-lg font-black font-mono text-white">
                          {formatRupiah(rem.amount)}
                        </div>
                        <div className="text-[10px] text-[#E0A96D] font-medium mt-0.5">
                          {rem.walletName}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 mt-4">
                        {!rem.isPaid && (
                          <button
                            onClick={() => onPayReminder(rem)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
                            title="Tandai Sudah Bayar / Lunasi Sekarang"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{isReceivable ? 'Terima Sekarang' : 'Bayar Sekarang'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEditReminder(rem)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#E0A96D] hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Pengingat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteReminder(rem)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                          title="Hapus Pengingat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            )
          })}
        </div>
      )}
    </section>
  )
}
