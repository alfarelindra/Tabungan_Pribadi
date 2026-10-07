import React from 'react'
import { Target, Plus, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import { formatRupiah, formatDateIndo } from '../utils/formatters'
import TiltCard from './3d/TiltCard'
import GoalProgressVault3D from './3d/GoalProgressVault3D'

export default function FinancialGoals({
  goals = [],
  onAddNewGoal,
  onEditGoal,
  onDeleteGoal,
  onDepositGoal,
  onWithdrawGoal
}) {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E0A96D]/15 text-[#E0A96D]">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tujuan Finansial & Brankas 3D</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30">
                {goals.length} Target
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alokasikan dana khusus untuk target impian dan dana darurat secara terencana dengan visualisasi brankas silinder 3D
          </p>
        </div>

        <button
          onClick={onAddNewGoal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-gold-gradient bg-rose-gold-gradient-hover text-slate-950 text-xs font-bold shadow-md glow-rose-gold active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>Buat Target Baru</span>
        </button>
      </div>

      {/* Grid Kartu Tujuan Finansial */}
      {goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-slate-800">
          <Target className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-white">Belum Ada Target Finansial</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Mulai rencanakan dana darurat, pembelian laptop, atau liburan impian Anda.
          </p>
          <button
            onClick={onAddNewGoal}
            className="px-4 py-2 rounded-xl bg-rose-gold-gradient text-slate-950 text-xs font-bold cursor-pointer"
          >
            Mulai Buat Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {goals.map((goal) => {
            const isDone = goal.percentage >= 100

            return (
              <TiltCard
                key={goal.id}
                maxTilt={9}
                perspective={950}
                scale={1.02}
                glare={true}
                className="h-full"
              >
                <div className="glass-card-interactive relative overflow-hidden rounded-2xl p-5 border border-slate-800/80 hover:border-[#E0A96D]/40 group flex flex-col justify-between h-full shadow-xl shadow-black/50">
                  {/* Ambient Top Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(224,169,109,0.14),transparent_70%)] pointer-events-none -mr-4 -mt-4"></div>

                  <div>
                    {/* Top Bar: Kategori, Deadline & Action Menu */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-[#F5C2C8] border border-[#B76E79]/30">
                        {goal.category || 'Tabungan'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditGoal(goal)}
                          className="p-1 rounded-md text-slate-500 hover:text-[#E0A96D] hover:bg-white/5 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Edit Target"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteGoal(goal)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Hapus Target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Goal Name */}
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-rose-gold-gradient transition-colors">
                      {goal.name}
                    </h3>

                    {goal.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                        {goal.notes}
                      </p>
                    )}

                    {/* Deadline & Status Badge */}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {goal.targetDate && (
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Calendar className="w-3 h-3 text-[#E0A96D]" />
                          <span>{formatDateIndo(goal.targetDate)}</span>
                        </div>
                      )}

                      {isDone ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tercapai 🎉
                        </span>
                      ) : goal.isOverdue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Lewat Target
                        </span>
                      ) : goal.daysRemaining !== null ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {goal.daysRemaining} hari lagi
                        </span>
                      ) : null}
                    </div>

                    {/* Indikator Brankas Silinder Kaca 3D */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/60">
                      <GoalProgressVault3D
                        percentage={goal.percentage}
                        currentAmount={goal.currentAmount}
                        targetAmount={goal.targetAmount}
                        isCompleted={isDone}
                      />
                    </div>

                    {/* Nominal Terkumpul & Target */}
                    <div className="mt-2 space-y-1 bg-[#090D15]/60 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Terkumpul</span>
                          <span className="text-base font-black font-mono text-white">
                            {formatRupiah(goal.currentAmount)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target Akhir</span>
                          <span className="text-xs text-slate-300 font-mono">
                            {formatRupiah(goal.targetAmount)}
                          </span>
                        </div>
                      </div>

                      {!isDone && (
                        <div className="text-[11px] text-slate-400 pt-1 flex justify-between border-t border-slate-800/40">
                          <span>Sisa Target:</span>
                          <span className="font-mono text-[#E0A96D] font-medium">{formatRupiah(goal.remainingAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Buttons: Tambah Dana & Tarik Dana */}
                  <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-800/60">
                    <button
                      onClick={() => onDepositGoal(goal)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#B76E79]/20 to-[#E0A96D]/20 hover:from-[#B76E79]/30 hover:to-[#E0A96D]/30 border border-[#E0A96D]/40 text-[#E0A96D] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Tambah Dana</span>
                    </button>

                    <button
                      onClick={() => onWithdrawGoal(goal)}
                      disabled={goal.currentAmount <= 0}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#121826] hover:bg-[#1A2234] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Tarik Dana</span>
                    </button>
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
