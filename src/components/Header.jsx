import React from 'react'
import { PlusCircle, Download, ChevronLeft, ChevronRight, Sparkles, Calendar, LogOut, User } from 'lucide-react'
import { formatMonthName } from '../utils/formatters'

export default function Header({
  selectedMonth,
  onMonthChange,
  onOpenNewTransaction,
  onOpenExportImport,
  user,
  onLogout
}) {
  // Hitung bulan sebelumnya dan bulan berikutnya
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') return
    const [year, month] = selectedMonth.split('-').map(Number)
    const prevDate = new Date(year, month - 2, 1)
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const handleNextMonth = () => {
    if (selectedMonth === 'all') return
    const [year, month] = selectedMonth.split('-').map(Number)
    const nextDate = new Date(year, month, 1)
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  return (
    <header className="border-b border-rose-900/20 bg-[#090D14]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#994D58] via-[#B76E79] to-[#F3C5B5] p-[1.5px] shadow-lg shadow-rose-950/40">
                <div className="w-full h-full bg-[#0E131E] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#E0A96D]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center">
                    Astaron <span className="ml-1 text-rose-gold-gradient font-extrabold">Finance</span>
                  </h1>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#B76E79]/20 text-[#F5C2C8] border border-[#B76E79]/40 tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  Luxury Personal Wealth & Expense Intelligence
                </p>
              </div>
            </div>

            {/* Quick Action Mobile Only */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenNewTransaction}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-gold-gradient text-slate-950 font-bold text-xs shadow-md glow-rose-gold active:scale-95 transition-transform"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Catat</span>
              </button>
            </div>
          </div>

          {/* Controls: Month Selector & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 sm:gap-3">
            
            {/* Month Navigator */}
            <div className="flex items-center bg-[#111724] border border-slate-800 hover:border-[#B76E79]/40 rounded-xl p-1 transition-all">
              <button
                onClick={handlePrevMonth}
                disabled={selectedMonth === 'all'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-3">
                <Calendar className="w-3.5 h-3.5 text-[#E0A96D]" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200 min-w-[120px] text-center">
                  {selectedMonth === 'all' ? 'Semua Riwayat' : formatMonthName(selectedMonth)}
                </span>
              </div>

              <button
                onClick={handleNextMonth}
                disabled={selectedMonth === 'all'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tombol Ekspor & Impor Data */}
            <button
              onClick={onOpenExportImport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131926] hover:bg-[#1A2234] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
              title="Backup atau Restore Data Keuangan"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Data & Cadangan</span>
            </button>

            {/* Tombol Utama Tambah Transaksi Desktop */}
            <button
              onClick={onOpenNewTransaction}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-gold-gradient bg-rose-gold-gradient-hover text-slate-950 font-bold text-sm shadow-lg glow-rose-gold active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Tambah Transaksi</span>
            </button>

            {/* User Badge & Sign Out Button */}
            {user && (
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 ml-1">
                <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0C101A] border border-slate-800 text-[11px] text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="truncate max-w-[130px]">{user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#121826] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                  title="Keluar / Sign Out dari Akun Supabase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  )
}
