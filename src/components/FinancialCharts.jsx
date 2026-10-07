import React, { useState } from 'react'
import { BarChart3, PieChart, TrendingUp, Layers, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

export default function FinancialCharts({ summary }) {
  const [activeTab, setActiveTab] = useState('monthly') // 'monthly' | 'daily'
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const monthlyTrend = summary?.monthlyTrend || []
  const expenseCategories = summary?.expenseCategories || []
  const dailyTrend = summary?.dailyTrend || []

  // Hitung nilai tertinggi untuk penskalaan bar chart bulanan
  const maxMonthlyValue = Math.max(
    ...monthlyTrend.map(d => Math.max(d.income, d.expense)),
    1000000
  )

  // Hitung total pengeluaran untuk persentase kategori
  const totalExpense = summary?.monthlyExpense || 0

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. VISUALISASI GRAFIK TREN KEUANGAN (2 KOLOM) */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#E0A96D]/15 text-[#E0A96D]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tren Arus Keuangan
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Perbandingan arus kas pemasukan dan pengeluaran berkala
            </p>
          </div>

          {/* Toggle Tab Grafik */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs mr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
                <span className="text-slate-400">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-[#B76E79] to-[#E0A96D] inline-block"></span>
                <span className="text-slate-400">Pengeluaran</span>
              </div>
            </div>

            <div className="bg-[#0C101A] border border-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                6 Bulan
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'daily'
                    ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Harian
              </button>
            </div>
          </div>
        </div>

        {/* Chart View Content */}
        {activeTab === 'monthly' ? (
          <div className="h-64 sm:h-72 w-full flex flex-col justify-end pt-4">
            {/* Bars Container */}
            <div className="grid grid-cols-6 gap-2 sm:gap-4 h-52 items-end border-b border-slate-800/80 pb-2 relative">
              {monthlyTrend.map((item, idx) => {
                const incomeHeight = Math.max((item.income / maxMonthlyValue) * 100, 3)
                const expenseHeight = Math.max((item.expense / maxMonthlyValue) * 100, 3)
                const isHovered = hoveredIndex === idx

                return (
                  <div
                    key={item.monthKey}
                    className="h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 bg-[#0F1523] border border-[#E0A96D]/40 rounded-xl p-2.5 shadow-2xl text-[11px] min-w-[140px] pointer-events-none animate-fade-in backdrop-blur-md">
                        <div className="font-bold text-white mb-1 border-b border-slate-800 pb-1">
                          {item.label}
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Masuk:</span>
                          <span className="font-mono font-medium">{formatRupiah(item.income)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#F5C2C8]">
                          <span>Keluar:</span>
                          <span className="font-mono font-medium">{formatRupiah(item.expense)}</span>
                        </div>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incomeHeight}%` }}
                        className="w-1/2 max-w-[18px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                      ></div>

                      {/* Expense Bar (Rose Gold) */}
                      <div
                        style={{ height: `${expenseHeight}%` }}
                        className="w-1/2 max-w-[18px] bg-gradient-to-t from-[#8E434D] via-[#B76E79] to-[#F3C5B5] rounded-t-md transition-all duration-500 group-hover:brightness-125 shadow-sm shadow-[#B76E79]/20"
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* X-Axis Month Labels */}
            <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-3 text-center">
              {monthlyTrend.map((item, idx) => (
                <span
                  key={item.monthKey}
                  className={`text-[11px] sm:text-xs font-semibold ${
                    hoveredIndex === idx ? 'text-[#E0A96D]' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Daily Breakdown List/Timeline */
          <div className="h-64 sm:h-72 w-full overflow-y-auto pr-1">
            {dailyTrend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Calendar className="w-8 h-8 mb-2 opacity-40 text-[#E0A96D]" />
                Belum ada transaksi harian di bulan ini
              </div>
            ) : (
              <div className="space-y-2">
                {dailyTrend.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0F1422] border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E0A96D]"></div>
                      <span className="font-semibold text-slate-200">{day.date}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      {day.income > 0 && (
                        <span className="text-emerald-400 flex items-center">
                          +{formatRupiah(day.income)}
                        </span>
                      )}
                      {day.expense > 0 && (
                        <span className="text-[#F5C2C8] flex items-center">
                          -{formatRupiah(day.expense)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. PROPORSI PENGELUARAN PER KATEGORI (1 KOLOM) */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#B76E79]/20 text-[#F5C2C8]">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Kategori Pengeluaran
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#E0A96D]">
              {expenseCategories.length} Kategori
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-5">
            Distribusi alokasi dana pengeluaran bulan ini
          </p>

          {/* List Kategori dengan Progress Bar Estetik */}
          <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
            {expenseCategories.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                Belum ada data pengeluaran bulan ini
              </div>
            ) : (
              expenseCategories.map((cat, i) => (
                <div key={cat.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E0A96D]"></span>
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{cat.percentage}%</span>
                      <span className="font-mono font-medium text-white">
                        {formatRupiah(cat.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar with Rose Gold Gradient */}
                  <div className="w-full h-2 rounded-full bg-[#0C101A] overflow-hidden p-[1px] border border-slate-800">
                    <div
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#994D58] via-[#B76E79] to-[#F3C5B5] transition-all duration-700 group-hover:brightness-125"
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Total Note */}
        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Total Terpakai:</span>
          <span className="font-bold text-rose-gold-gradient font-mono text-sm">
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

    </section>
  )
}
