import React, { useMemo } from "react"
import { Brain, TrendingUp, TrendingDown, Minus, Zap, AlertCircle, CheckCircle2, Clock, BarChart2 } from "lucide-react"
import { formatRupiah } from "../utils/formatters"

function getHealthScore(savingsRate, budgetUsage, hasGoals, hasReminders) {
  let score = 0
  // Savings rate: max 40 pts
  if (savingsRate >= 20) score += 40
  else if (savingsRate >= 10) score += 25
  else if (savingsRate >= 0) score += 10
  else score += 0
  // Budget usage: max 30 pts
  if (budgetUsage <= 0.8) score += 30
  else if (budgetUsage <= 1.0) score += 15
  else score += 0
  // Has goals: 15 pts
  if (hasGoals) score += 15
  // Has reminders managed: 15 pts
  if (hasReminders) score += 15
  return Math.min(100, score)
}

function getScoreGrade(score) {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
  if (score >= 65) return { label: "Good", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" }
  if (score >= 45) return { label: "Fair", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
  return { label: "Needs Work", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" }
}

export default function FinancialHealthScore({ summary, goals = [], reminders = [] }) {
  const metrics = useMemo(() => {
    const income = summary?.monthlyIncome || 0
    const expense = summary?.monthlyExpense || 0
    const budget = summary?.budget || 0
    const totalBalance = summary?.totalBalance || 0

    const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0
    const budgetUsage = budget > 0 ? expense / budget : 0
    const dailyAvgExpense = expense / 30
    const runwayDays = dailyAvgExpense > 0 ? Math.floor(totalBalance / dailyAvgExpense) : 999

    const hasGoals = goals.length > 0
    const hasReminders = reminders.filter(r => !r.isPaid).length > 0

    const score = getHealthScore(savingsRate, budgetUsage, hasGoals, hasReminders)
    const grade = getScoreGrade(score)

    // Compare with previous summary if available (use estimate)
    const biggestCategory = (() => {
      const cats = summary?.categoryBreakdown || []
      if (!cats.length) return null
      return cats.sort((a, b) => b.amount - a.amount)[0]
    })()

    return { income, expense, budget, totalBalance, savingsRate, budgetUsage, runwayDays, score, grade, biggestCategory, dailyAvgExpense }
  }, [summary, goals, reminders])

  const { income, expense, budget, totalBalance, savingsRate, budgetUsage, runwayDays, score, grade, biggestCategory, dailyAvgExpense } = metrics

  const SavingsIcon = savingsRate >= 20 ? TrendingUp : savingsRate >= 0 ? Minus : TrendingDown

  return (
    <section className="glass-card rounded-3xl overflow-hidden border border-[#E0A96D]/15 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/30 border border-violet-500/30 flex items-center justify-center">
          <Brain className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Financial Health Score</h2>
          <p className="text-xs text-slate-500">Analisis cerdas keuangan bulan berjalan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Circle */}
        <div className={"rounded-2xl border p-5 flex flex-col items-center justify-center text-center " + grade.bg}>
          <div className={"text-5xl font-extrabold font-mono tabular-nums " + grade.color}>{score}</div>
          <div className="text-xs text-slate-400 mt-1">/ 100</div>
          <div className={"text-sm font-bold mt-2 " + grade.color}>{grade.label}</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
            <div className={"h-1.5 rounded-full transition-all duration-700 " + (score >= 85 ? "bg-emerald-400" : score >= 65 ? "bg-cyan-400" : score >= 45 ? "bg-amber-400" : "bg-rose-400")} style={{ width: score + "%" }} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[
            {
              label: "Savings Rate",
              value: savingsRate.toFixed(1) + "%",
              Icon: SavingsIcon,
              color: savingsRate >= 20 ? "text-emerald-400" : savingsRate >= 10 ? "text-cyan-400" : "text-rose-400",
              desc: savingsRate >= 20 ? "Sangat baik!" : savingsRate >= 10 ? "Cukup, tingkatkan" : savingsRate >= 0 ? "Perlu ditingkatkan" : "Defisit bulan ini",
            },
            {
              label: "Budget Usage",
              value: (budgetUsage * 100).toFixed(1) + "%",
              Icon: BarChart2,
              color: budgetUsage <= 0.8 ? "text-emerald-400" : budgetUsage <= 1.0 ? "text-amber-400" : "text-rose-400",
              desc: budgetUsage <= 0.8 ? "On track" : budgetUsage <= 1.0 ? ">80% anggaran" : "Melebihi anggaran!",
            },
            {
              label: "Runway",
              value: runwayDays >= 999 ? "∞ hari" : runwayDays + " hari",
              Icon: Clock,
              color: runwayDays >= 90 ? "text-emerald-400" : runwayDays >= 30 ? "text-amber-400" : "text-rose-400",
              desc: runwayDays >= 90 ? "Saldo aman >3 bulan" : runwayDays >= 30 ? "Cadangan 1 bulan" : "Saldo kritis!",
            },
            {
              label: "Pengeluaran/Hari",
              value: formatRupiah(dailyAvgExpense),
              Icon: Zap,
              color: "text-[#E0A96D]",
              desc: "Rata-rata harian bulan ini",
            },
          ].map(({ label, value, Icon, color, desc }) => (
            <div key={label} className="bg-[#0B0F19] rounded-xl border border-slate-800 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={"w-3.5 h-3.5 " + color} />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
              </div>
              <div className={"text-lg font-extrabold font-mono " + color}>{value}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights & Alerts */}
      <div className="mt-4 space-y-2">
        {budgetUsage > 0.8 && (
          <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-300">
              <strong>Peringatan Anggaran:</strong> Pengeluaran bulan ini sudah mencapai {(budgetUsage * 100).toFixed(0)}% dari anggaran bulanan. 
              {budgetUsage > 1.0 ? " Anggaran telah terlampaui!" : " Sisa anggaran: " + formatRupiah(budget - expense) + "."}
            </div>
          </div>
        )}
        {savingsRate < 10 && income > 0 && (
          <div className="flex items-start gap-2.5 bg-rose-500/5 border border-rose-500/20 rounded-xl px-3 py-2.5">
            <TrendingDown className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300">
              <strong>Tingkat Tabungan Rendah:</strong> Tabungan bulan ini hanya {savingsRate.toFixed(1)}%. Target idealnya 20%+ dari pemasukan ({formatRupiah(income * 0.2)}/bulan).
            </div>
          </div>
        )}
        {biggestCategory && (
          <div className="flex items-start gap-2.5 bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#E0A96D] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400">
              <strong className="text-slate-300">Kategori Terbesar:</strong> Pengeluaran terbanyak di <strong className="text-[#E0A96D]">{biggestCategory.category || biggestCategory.name}</strong> — {formatRupiah(biggestCategory.amount || 0)} bulan ini.
            </div>
          </div>
        )}
        {runwayDays < 30 && runwayDays >= 0 && (
          <div className="flex items-start gap-2.5 bg-rose-500/5 border border-rose-500/20 rounded-xl px-3 py-2.5">
            <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300">
              <strong>Runway Kritis:</strong> Berdasarkan rata-rata pengeluaran harian, saldo operasional Anda diperkirakan hanya cukup untuk {runwayDays} hari ke depan.
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
