import React, { useState } from 'react'
import { Target, Edit3, Check, AlertTriangle, ShieldCheck } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

export default function BudgetOverview({
  monthlyExpense = 0,
  budget = 8000000,
  categories = [],
  onUpdateBudget
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [budgetValue, setBudgetValue] = useState(budget)

  const usedPercentage = budget > 0 ? Math.round((monthlyExpense / budget) * 100) : 0
  const remainingBudget = budget - monthlyExpense
  const isOverBudget = remainingBudget < 0
  const isWarning = usedPercentage >= 80 && !isOverBudget

  // Category overspending detection (>40% of entire budget or >80% warning threshold)
  const highRiskCategories = categories.filter(c => {
    const catPercent = budget > 0 ? (c.amount / (budget * 0.35)) * 100 : 0
    return catPercent >= 80
  })

  const handleSave = (e) => {
    e.preventDefault()
    onUpdateBudget(Number(budgetValue))
    setIsEditing(false)
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Info & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E0A96D]/20 to-[#B76E79]/20 border border-[#E0A96D]/30 flex items-center justify-center text-[#E0A96D]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Target Anggaran Bulanan
              </h3>
              {isOverBudget ? (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Melebihi Batas
                </span>
              ) : isWarning ? (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Waspada 80%+
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Terkendali
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau batas pengeluaran & deteksi overspending per kategori secara otomatis
            </p>
          </div>
        </div>

        {/* Right Side: Nominal & Edit Action */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#0C101A] border border-[#E0A96D]/50 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#E0A96D] w-36"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                title="Simpan"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Batas Maksimal:</div>
                <div className="text-sm font-bold font-mono text-white">
                  {formatRupiah(budget)}
                </div>
              </div>
              <button
                onClick={() => {
                  setBudgetValue(budget)
                  setIsEditing(true)
                }}
                className="p-2 rounded-xl bg-[#141B2B] hover:bg-[#1E273D] border border-slate-800 text-slate-400 hover:text-[#E0A96D] transition-colors"
                title="Ubah Target Anggaran"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Progress Bar & Realisasi */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">
            Terpakai: <strong className="text-white font-mono">{formatRupiah(monthlyExpense)}</strong> ({usedPercentage}%)
          </span>
          <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-300'}>
            {isOverBudget ? 'Over Budget:' : 'Sisa Kuota:'}{' '}
            <strong className="font-mono">{formatRupiah(Math.abs(remainingBudget))}</strong>
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#0C101A] border border-slate-800 overflow-hidden p-[2px]">
          <div
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              isOverBudget
                ? 'bg-gradient-to-r from-rose-600 to-red-500'
                : isWarning
                ? 'bg-gradient-to-r from-amber-500 to-rose-400'
                : 'bg-gradient-to-r from-[#8E434D] via-[#B76E79] to-[#E0A96D]'
            }`}
          ></div>
        </div>

        {/* Smart Category Overspending Alerts */}
        {highRiskCategories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/40 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Peringatan Kategori:
            </span>
            {highRiskCategories.map(cat => {
              const shareOfExp = monthlyExpense > 0 ? Math.round((cat.amount / monthlyExpense) * 100) : 0
              const isCrit = shareOfExp >= 45
              return (
                <span
                  key={cat.name}
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                    isCrit
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <strong>{cat.name}</strong>: {formatRupiah(cat.amount)} ({shareOfExp}% dari total belanja)
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
