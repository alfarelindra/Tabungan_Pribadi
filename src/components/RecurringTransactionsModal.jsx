import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, RefreshCw, Plus, Trash2, Clock, Bell, AlertCircle } from "lucide-react"
import { formatRupiah } from "../utils/formatters"

const FREQUENCIES = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
]

const LS_KEY = "astaron_recurring_txns"

function loadRecurring() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") } catch { return [] }
}
function saveRecurring(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch {}
}

function getNextDate(frequency, startDate) {
  const d = new Date(startDate + "T00:00:00")
  const now = new Date()
  while (d <= now) {
    if (frequency === "daily") d.setDate(d.getDate() + 1)
    else if (frequency === "weekly") d.setDate(d.getDate() + 7)
    else if (frequency === "monthly") d.setMonth(d.getMonth() + 1)
    else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1)
    else break
  }
  return d.toISOString().slice(0, 10)
}

function isDue(recurring) {
  const nextDate = getNextDate(recurring.frequency, recurring.startDate)
  const today = new Date().toISOString().slice(0, 10)
  return nextDate <= today
}

export default function RecurringTransactionsModal({ isOpen, onClose, wallets = [], onAddTransaction }) {
  const [list, setList] = useState(loadRecurring)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", amount: "", type: "expense", category: "Lainnya", walletId: "", frequency: "monthly", startDate: new Date().toISOString().slice(0, 10) })
  const [error, setError] = useState("")

  useEffect(() => { saveRecurring(list) }, [list])

  const dueItems = list.filter(isDue)

  const handleAdd = () => {
    if (!form.name || !form.amount || !form.walletId) { setError("Nama, nominal, dan dompet wajib diisi."); return }
    const newItem = { ...form, id: Date.now(), amount: Number(form.amount), startDate: form.startDate, addedHistory: [] }
    setList(prev => [...prev, newItem])
    setAdding(false)
    setForm({ name: "", amount: "", type: "expense", category: "Lainnya", walletId: "", frequency: "monthly", startDate: new Date().toISOString().slice(0, 10) })
    setError("")
  }

  const handleRecord = (item) => {
    const today = new Date().toISOString().slice(0, 10)
    onAddTransaction({
      type: item.type,
      category: item.category,
      amount: item.amount,
      walletId: item.walletId,
      date: today,
      notes: "[Rutin] " + item.name,
    })
    setList(prev => prev.map(r => r.id === item.id ? { ...r, startDate: today, addedHistory: [...(r.addedHistory||[]), today] } : r))
  }

  const handleDelete = (id) => setList(prev => prev.filter(r => r.id !== id))

  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }} onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-lg max-h-[92vh] flex flex-col bg-[#0D1117] border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Transaksi Rutin</h2>
                <p className="text-[10px] text-slate-500">Jadwalkan gaji, tagihan, dan langganan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setAdding(v => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 hover:border-cyan-500/50 transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {dueItems.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Bell className="w-3.5 h-3.5" /> {dueItems.length} Transaksi Jatuh Tempo Hari Ini
                </div>
                <div className="space-y-2">
                  {dueItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-[#0B0F19] rounded-xl px-3 py-2.5">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.type === "income" ? "Pemasukan" : "Pengeluaran"} • {FREQUENCIES.find(f => f.value === item.frequency)?.label}</div>
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-300">{formatRupiah(item.amount)}</div>
                      <button onClick={() => handleRecord(item)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer">
                        Catat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence>
              {adding && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-[#0B0F19] border border-cyan-500/20 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Transaksi Rutin Baru</h3>
                    {[
                      { label: "Nama", field: "name", type: "text", ph: "cth. Gaji Bulanan" },
                      { label: "Nominal (Rp)", field: "amount", type: "number", ph: "0" },
                    ].map(({ label, field, type, ph }) => (
                      <div key={field}>
                        <label className="text-xs text-slate-400 font-semibold block mb-1">{label}</label>
                        <input type={type} value={form[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} placeholder={ph}
                          className="w-full bg-[#131A2B] border border-slate-700 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors" />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 font-semibold block mb-1">Tipe</label>
                        <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-[#131A2B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none">
                          <option value="income">Pemasukan</option>
                          <option value="expense">Pengeluaran</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold block mb-1">Frekuensi</label>
                        <select value={form.frequency} onChange={e => setForm(prev => ({ ...prev, frequency: e.target.value }))}
                          className="w-full bg-[#131A2B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none">
                          {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 font-semibold block mb-1">Dompet</label>
                        <select value={form.walletId} onChange={e => setForm(prev => ({ ...prev, walletId: e.target.value }))}
                          className="w-full bg-[#131A2B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none">
                          <option value="">-- Pilih --</option>
                          {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold block mb-1">Mulai</label>
                        <input type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full bg-[#131A2B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none" />
                      </div>
                    </div>
                    {error && <div className="flex items-center gap-2 text-rose-400 text-xs"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setAdding(false); setError("") }} className="flex-1 py-2 rounded-xl bg-[#131A2B] border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">Batal</button>
                      <button onClick={handleAdd} className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer">Simpan</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {list.length === 0 && !adding && (
              <div className="text-center py-10 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Belum ada transaksi rutin.</p>
                <p className="text-xs mt-1">Tambahkan gaji, cicilan, atau langganan berkala.</p>
              </div>
            )}
            {list.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Semua Jadwal Rutin</h3>
                {list.map(item => {
                  const next = getNextDate(item.frequency, item.startDate)
                  const due = isDue(item)
                  return (
                    <div key={item.id} className={"flex items-center gap-3 rounded-xl px-3 py-3 border " + (due ? "bg-amber-500/5 border-amber-500/20" : "bg-[#0B0F19] border-slate-800")}>
                      <RefreshCw className={"w-4 h-4 shrink-0 " + (item.type === "income" ? "text-emerald-400" : "text-rose-400")} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-500">Berikutnya: {next} • {FREQUENCIES.find(f => f.value === item.frequency)?.label}</div>
                      </div>
                      <div className={"text-xs font-mono font-bold " + (item.type === "income" ? "text-emerald-400" : "text-slate-300")}>{formatRupiah(item.amount)}</div>
                      <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-rose-400 transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
