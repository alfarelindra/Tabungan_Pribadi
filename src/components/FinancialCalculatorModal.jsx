import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Calculator, ShieldCheck, TrendingUp, CreditCard, ChevronRight } from "lucide-react"
import { formatRupiah } from "../utils/formatters"

const tabs = [
  { id: "emergency", label: "Dana Darurat", Icon: ShieldCheck, color: "text-amber-400" },
  { id: "compound", label: "Bunga Majemuk", Icon: TrendingUp, color: "text-emerald-400" },
  { id: "debt", label: "Pelunasan Hutang", Icon: CreditCard, color: "text-rose-400" },
]

// -- Emergency Fund Tab --
function EmergencyFundCalc({ monthlyExpense }) {
  const [expense, setExpense] = useState(monthlyExpense || "")
  const [multiplier, setMultiplier] = useState(6)
  const target = (Number(expense) || 0) * multiplier
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Rata-rata Pengeluaran Bulanan (Rp)</label>
        <input type="number" value={expense} onChange={e => setExpense(e.target.value)} placeholder="cth. 4000000"
          className="w-full bg-[#0B0F19] border border-slate-700 focus:border-amber-500/60 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none transition-colors" />
      </div>
      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Lipatan Dana Darurat</label>
        <div className="flex gap-2">
          {[3, 6, 12].map(m => (
            <button key={m} onClick={() => setMultiplier(m)}
              className={"flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer " + (multiplier === m ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-[#0B0F19] border-slate-700 text-slate-400 hover:border-slate-600")}>
              {m}x
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">3x = Minimum • 6x = Ideal Karyawan • 12x = Freelancer / Wirausaha</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-[#131A2B] border border-amber-500/20 p-5">
        <div className="text-xs text-amber-300/70 uppercase tracking-wider font-semibold mb-1">Target Dana Darurat Ideal ({multiplier}x)</div>
        <div className="text-3xl font-extrabold font-mono text-amber-300">{formatRupiah(target)}</div>
        {target > 0 && (
          <p className="text-xs text-slate-500 mt-2">Simpan dalam instrumen likuid: tabungan, deposito, atau reksa dana pasar uang.</p>
        )}
      </div>
    </div>
  )
}

// -- Compound Interest Tab --
function CompoundCalc() {
  const [principal, setPrincipal] = useState("")
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const result = useMemo(() => {
    const P = Number(principal) || 0
    const PMT = Number(monthly) || 0
    const r = (Number(rate) || 0) / 100 / 12
    const n = (Number(years) || 0) * 12
    if (n <= 0) return null
    let fv = 0
    if (r === 0) {
      fv = P + PMT * n
    } else {
      fv = P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r)
    }
    const totalInvested = P + PMT * n
    const profit = fv - totalInvested
    return { fv, totalInvested, profit }
  }, [principal, monthly, rate, years])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Modal Awal (Rp)", val: principal, set: setPrincipal, ph: "5000000" },
          { label: "Setoran Bulanan (Rp)", val: monthly, set: setMonthly, ph: "500000" },
          { label: "Return / Tahun (%)", val: rate, set: setRate, ph: "10" },
          { label: "Jangka Waktu (Tahun)", val: years, set: setYears, ph: "10" },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
            <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph}
              className="w-full bg-[#0B0F19] border border-slate-700 focus:border-emerald-500/60 rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none transition-colors" />
          </div>
        ))}
      </div>
      {result && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-[#131A2B] border border-emerald-500/20 p-4 space-y-3">
          {[
            { label: "Total Nilai Investasi", value: result.fv, color: "text-emerald-300", size: "text-2xl" },
            { label: "Total Modal Ditanamkan", value: result.totalInvested, color: "text-slate-300", size: "text-base" },
            { label: "Keuntungan Bunga Majemuk", value: result.profit, color: "text-emerald-400", size: "text-base" },
          ].map(({ label, value, color, size }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-slate-400">{label}</span>
              <span className={"font-bold font-mono " + size + " " + color}>{formatRupiah(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// -- Debt Payoff Tab --
function DebtPayoffCalc() {
  const [debts, setDebts] = useState([
    { id: 1, name: "Kartu Kredit", balance: 5000000, rate: 24, minPay: 200000 },
    { id: 2, name: "KTA", balance: 15000000, rate: 14, minPay: 500000 },
  ])
  const [extraPay, setExtraPay] = useState(500000)
  const [method, setMethod] = useState("snowball")

  const simulate = (debts, extra, method) => {
    let ds = debts.map(d => ({ ...d, balance: Number(d.balance), rate: Number(d.rate), minPay: Number(d.minPay) })).filter(d => d.balance > 0)
    if (method === "snowball") ds.sort((a, b) => a.balance - b.balance)
    else ds.sort((a, b) => b.rate - a.rate)
    let months = 0, totalInterest = 0
    const MAX = 600
    while (ds.some(d => d.balance > 0) && months < MAX) {
      months++
      let extraLeft = Number(extra) || 0
      ds = ds.map(d => {
        if (d.balance <= 0) return d
        const interest = (d.balance * (d.rate / 100)) / 12
        totalInterest += interest
        d.balance = d.balance + interest - d.minPay
        return d
      })
      for (let i = 0; i < ds.length; i++) {
        if (ds[i].balance <= 0) continue
        const payment = Math.min(extraLeft, ds[i].balance)
        ds[i].balance -= payment
        extraLeft -= payment
        if (extraLeft <= 0) break
      }
      ds = ds.map(d => ({ ...d, balance: Math.max(0, d.balance) }))
    }
    return { months, totalInterest }
  }

  const addDebt = () => setDebts(prev => [...prev, { id: Date.now(), name: "", balance: 0, rate: 0, minPay: 0 }])
  const upd = (id, field, val) => setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d))
  const rem = (id) => setDebts(prev => prev.filter(d => d.id !== id))

  const snowball = simulate(debts, extraPay, "snowball")
  const avalanche = simulate(debts, extraPay, "avalanche")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Daftar Hutang</span>
          <button onClick={addDebt} className="text-xs text-rose-400 border border-rose-500/30 px-2 py-1 rounded-lg hover:border-rose-500/50 transition-all cursor-pointer">+ Tambah</button>
        </div>
        {debts.map(d => (
          <div key={d.id} className="bg-[#0B0F19] border border-slate-700 rounded-xl p-3 grid grid-cols-2 gap-2">
            <input value={d.name} onChange={e => upd(d.id, "name", e.target.value)} placeholder="Nama hutang" className="col-span-2 bg-transparent text-xs text-white outline-none border-b border-slate-700 pb-1.5 mb-1" />
            {[
              { field: "balance", label: "Saldo (Rp)", ph: "5000000" },
              { field: "rate", label: "Bunga/Tahun (%)", ph: "24" },
              { field: "minPay", label: "Min. Bayar/Bulan (Rp)", ph: "200000" },
            ].map(({ field, label, ph }) => (
              <div key={field} className={field === "minPay" ? "col-span-2" : ""}>
                <div className="text-[9px] text-slate-500 mb-0.5">{label}</div>
                <input type="number" value={d[field] || ""} onChange={e => upd(d.id, field, Number(e.target.value))} placeholder={ph} className="w-full bg-transparent text-xs text-white font-mono outline-none" />
              </div>
            ))}
            <button onClick={() => rem(d.id)} className="col-span-2 text-[10px] text-rose-400/60 hover:text-rose-400 text-right cursor-pointer">Hapus</button>
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Pembayaran Ekstra / Bulan (Rp)</label>
        <input type="number" value={extraPay} onChange={e => setExtraPay(e.target.value)} className="w-full bg-[#0B0F19] border border-slate-700 focus:border-rose-500/60 rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none transition-colors" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { m: "snowball", label: "Snowball", desc: "Saldo terkecil dulu", data: snowball, color: "rose" },
          { m: "avalanche", label: "Avalanche", desc: "Bunga tertinggi dulu", data: avalanche, color: "amber" },
        ].map(({ m, label, desc, data, color }) => (
          <div key={m} className={"rounded-xl border p-4 cursor-pointer transition-all " + (method === m ? "bg-" + color + "-500/10 border-" + color + "-500/40" : "bg-[#0B0F19] border-slate-700 hover:border-slate-600")} onClick={() => setMethod(m)}>
            <div className={"text-xs font-bold text-" + color + "-400 mb-0.5"}>{label}</div>
            <div className="text-[10px] text-slate-500 mb-2">{desc}</div>
            <div className={"text-sm font-bold font-mono text-" + color + "-300"}>{data.months} Bulan</div>
            <div className="text-[10px] text-slate-500">Bunga: {formatRupiah(data.totalInterest)}</div>
          </div>
        ))}
      </div>
      {avalanche.months < snowball.months && (
        <p className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2">
          💡 Metode Avalanche lebih hemat {snowball.months - avalanche.months} bulan dan menghemat {formatRupiah(snowball.totalInterest - avalanche.totalInterest)} bunga.
        </p>
      )}
    </div>
  )
}

export default function FinancialCalculatorModal({ isOpen, onClose, monthlyExpense }) {
  const [activeTab, setActiveTab] = useState("emergency")
  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-lg max-h-[90vh] flex flex-col bg-[#0D1117] border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E0A96D]/15 border border-[#E0A96D]/30 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-[#E0A96D]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Kalkulator Finansial</h2>
                <p className="text-[10px] text-slate-500">Simulasi cerdas untuk keputusan optimal</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1 p-3 border-b border-slate-800/70 shrink-0 bg-[#0A0D14]">
            {tabs.map(({ id, label, Icon, color }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={"flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer " + (activeTab === id ? "bg-[#141B2B] border border-slate-700 text-white" : "text-slate-500 hover:text-slate-300")}>
                <Icon className={"w-3.5 h-3.5 " + (activeTab === id ? color : "")} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "emergency" && <EmergencyFundCalc monthlyExpense={monthlyExpense} />}
            {activeTab === "compound" && <CompoundCalc />}
            {activeTab === "debt" && <DebtPayoffCalc />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
