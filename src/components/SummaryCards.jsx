import React from 'react'
import { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, Sparkles, TrendingUp, ShieldAlert, CheckCircle } from 'lucide-react'
import { formatMonthName, formatRupiah } from '../utils/formatters'
import TiltCard from './3d/TiltCard'
import NumberCounter from './motion/NumberCounter'

export default function SummaryCards({ summary }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-[#121724] rounded-2xl border border-slate-800"></div>
        ))}
      </div>
    )
  }

  const {
    totalBalance = 0,
    monthlyIncome = 0,
    monthlyExpense = 0,
    monthlyNetSavings = 0,
    savingsRate = 0,
    selectedMonth
  } = summary

  const isSavingsPositive = monthlyNetSavings >= 0
  const isBalancePositive = totalBalance >= 0

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
      
      {/* 1. TOTAL SALDO (ALL TIME / NET WORTH) */}
      <TiltCard maxTilt={8} perspective={900} scale={1.015}>
        <div className="glass-card-interactive relative overflow-hidden rounded-2xl p-5 border border-[#E0A96D]/30 group h-full shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle_at_top_right,rgba(224,169,109,0.15),transparent_70%)] pointer-events-none -mr-4 -mt-4"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Saldo Bersih
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E0A96D]/20 to-[#B76E79]/30 border border-[#E0A96D]/30 flex items-center justify-center text-[#E0A96D] shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              <NumberCounter value={totalBalance} duration={850} />
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-xs">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                isBalancePositive 
                  ? 'bg-[#E0A96D]/15 text-[#F5C2C8] border border-[#E0A96D]/20'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
              }`}>
                <Sparkles className="w-3 h-3 text-[#E0A96D]" />
                {isBalancePositive ? 'Saldo Akumulatif Aman' : 'Defisit Terdeteksi'}
              </span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* 2. TOTAL PEMASUKAN BULAN INI */}
      <TiltCard maxTilt={8} perspective={900} scale={1.015}>
        <div className="glass-card-interactive relative overflow-hidden rounded-2xl p-5 border border-emerald-500/20 group h-full shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_70%)] pointer-events-none -mr-4 -mt-4"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pemasukan ({formatMonthName(selectedMonth).split(' ')[0]})
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-300 font-mono flex items-center">
              <span>+</span>
              <NumberCounter value={monthlyIncome} duration={750} />
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Arus Masuk
              </span>
              <span>bulan berjalan</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* 3. TOTAL PENGELUARAN BULAN INI */}
      <TiltCard maxTilt={8} perspective={900} scale={1.015}>
        <div className="glass-card-interactive relative overflow-hidden rounded-2xl p-5 border border-rose-500/20 group h-full shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.13),transparent_70%)] pointer-events-none -mr-4 -mt-4"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pengeluaran ({formatMonthName(selectedMonth).split(' ')[0]})
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-300 font-mono flex items-center">
              <span>-</span>
              <NumberCounter value={monthlyExpense} duration={750} />
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-400">
              <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" /> Arus Keluar
              </span>
              <span>bulan berjalan</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* 4. TABUNGAN BERSIH & RASIO TABUNGAN */}
      <TiltCard maxTilt={8} perspective={900} scale={1.015}>
        <div className="glass-card-interactive relative overflow-hidden rounded-2xl p-5 border border-slate-800 hover:border-[#E0A96D]/40 group h-full shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none -mr-4 -mt-4"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Arus Kas Bersih
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#1A2234] border border-slate-700 flex items-center justify-center text-[#E0A96D] shadow-sm">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono flex items-center ${
              isSavingsPositive ? 'text-slate-100' : 'text-rose-400'
            }`}>
              {isSavingsPositive ? <span>+</span> : null}
              <NumberCounter value={monthlyNetSavings} duration={800} />
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                savingsRate >= 20 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : savingsRate > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {savingsRate >= 20 ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <ShieldAlert className="w-3 h-3" />
                )}
                {savingsRate}% Tabungan
              </span>
              <span className="text-slate-400 text-[11px]">dari gaji</span>
            </div>
          </div>
        </div>
      </TiltCard>

    </section>
  )
}
