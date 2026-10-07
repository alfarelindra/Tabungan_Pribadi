import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Plus, Trash2, Globe } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', name: 'Rupiah Indonesia' },
  { code: 'USD', symbol: 'US\$', name: 'US Dollar' },
  { code: 'SGD', symbol: 'S\$', name: 'Singapore Dollar' },
]

const LS_KEY = 'astaron_networth_data'

function loadNWData() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    assets: [{ id: 1, name: 'Reksa Dana / Investasi', value: 0 }, { id: 2, name: 'Properti / Kendaraan', value: 0 }],
    debts: [{ id: 1, name: 'KTA / Pinjaman Online', value: 0 }],
    currency: 'IDR',
    customRates: { USD: 16000, SGD: 12000 },
  }
}

export default function NetWorthWidget({ wallets = [] }) {
  const [data, setData] = useState(loadNWData)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editRates, setEditRates] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
  }, [data])

  const totalWalletBalance = wallets.reduce((s, w) => s + (Number(w.currentBalance) || 0), 0)
  const totalAssets = data.assets.reduce((s, a) => s + (Number(a.value) || 0), 0)
  const totalDebts = data.debts.reduce((s, d) => s + (Number(d.value) || 0), 0)
  const netWorth = totalWalletBalance + totalAssets - totalDebts

  const rate = data.currency === 'USD' ? (data.customRates?.USD || 16000) : data.currency === 'SGD' ? (data.customRates?.SGD || 12000) : 1
  const currSymbol = CURRENCIES.find(c => c.code === data.currency)?.symbol || 'Rp'

  const fmt = (val) => {
    if (data.currency === 'IDR') return formatRupiah(val)
    const conv = val / rate
    return currSymbol + conv.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const addItem = (type) => setData(prev => ({ ...prev, [type]: [...prev[type], { id: Date.now(), name: '', value: 0 }] }))
  const updateItem = (type, id, field, val) => setData(prev => ({
    ...prev, [type]: prev[type].map(i => i.id === id ? { ...i, [field]: field === 'value' ? (Number(val) || 0) : val } : i)
  }))
  const removeItem = (type, id) => setData(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }))

  const netClass = netWorth > 0 ? 'text-emerald-300' : netWorth < 0 ? 'text-rose-400' : 'text-slate-300'
  const NetIcon = netWorth > 0 ? TrendingUp : netWorth < 0 ? TrendingDown : Minus

  return (
    <section className="glass-card rounded-3xl overflow-hidden border border-[#E0A96D]/15">
      <div className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none" onClick={() => setIsExpanded(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Net Worth Tracker</h2>
            <p className="text-xs text-slate-500">Kekayaan Bersih = Saldo + Aset - Hutang</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={"text-xl sm:text-2xl font-extrabold font-mono tracking-tight " + netClass}>{fmt(netWorth)}</div>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <NetIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500">{data.currency}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#141B2B] border border-slate-700 flex items-center justify-center text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }} className="overflow-hidden">
            <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-slate-800/60">
              <div className="grid grid-cols-3 gap-3 pt-5">
                {[
                  { label: 'Saldo Dompet', value: totalWalletBalance, color: 'text-[#E0A96D]', bg: 'bg-[#E0A96D]/10 border-[#E0A96D]/20' },
                  { label: 'Total Aset', value: totalAssets, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Total Hutang', value: totalDebts, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={"rounded-xl border p-3 text-center " + bg}>
                    <div className={"text-xs sm:text-sm font-bold font-mono " + color}>{fmt(value)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Mata Uang:</span>
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => setData(prev => ({ ...prev, currency: c.code }))}
                    className={"px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer " + (data.currency === c.code ? 'bg-[#E0A96D]/20 border-[#E0A96D]/40 text-[#E0A96D]' : 'bg-[#0F1522] border-slate-700 text-slate-400 hover:border-slate-600')}>
                    {c.code}
                  </button>
                ))}
                {data.currency !== 'IDR' && (
                  <button onClick={() => setEditRates(v => !v)} className="px-2 py-1 rounded-lg text-[10px] text-slate-500 border border-slate-700 hover:border-[#E0A96D]/30 transition-all cursor-pointer">Edit Kurs</button>
                )}
              </div>
              {editRates && data.currency !== 'IDR' && (
                <div className="flex gap-3 flex-wrap">
                  {['USD', 'SGD'].map(cur => (
                    <div key={cur} className="flex items-center gap-2 bg-[#0F1522] border border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-xs text-slate-400">1 {cur} =</span>
                      <input type="number" value={data.customRates?.[cur] ?? (cur === 'USD' ? 16000 : 12000)}
                        onChange={e => setData(prev => ({ ...prev, customRates: { ...prev.customRates, [cur]: Number(e.target.value) } }))}
                        className="w-24 bg-transparent text-xs text-white font-mono outline-none" />
                      <span className="text-xs text-slate-500">IDR</span>
                    </div>
                  ))}
                </div>
              )}
              {[{ key: 'assets', label: 'Aset & Investasi', color: 'emerald' }, { key: 'debts', label: 'Hutang & Kewajiban', color: 'rose' }].map(({ key, label, color }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={"text-xs font-bold uppercase tracking-wider text-" + color + "-400"}>{label}</h3>
                    <button onClick={() => addItem(key)} className={"flex items-center gap-1 text-[10px] text-" + color + "-400 hover:text-" + color + "-300 border border-" + color + "-500/30 hover:border-" + color + "-500/50 px-2 py-1 rounded-lg transition-all cursor-pointer"}>
                      <Plus className="w-3 h-3" /> Tambah
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data[key].map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input value={item.name} onChange={e => updateItem(key, item.id, 'name', e.target.value)} placeholder="Nama item..." className={"flex-1 bg-[#0F1522] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-" + color + "-500/50"} />
                        <input type="number" value={item.value || ''} onChange={e => updateItem(key, item.id, 'value', e.target.value)} placeholder="0" className="w-32 bg-[#0F1522] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none" />
                        <button onClick={() => removeItem(key, item.id)} className="text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl bg-gradient-to-r from-[#0F1825] to-[#131A2B] border border-[#E0A96D]/20 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Kekayaan Bersih</div>
                  <div className={"text-2xl font-extrabold font-mono mt-1 " + netClass}>{fmt(netWorth)}</div>
                </div>
                <NetIcon className={"w-10 h-10 " + netClass + " opacity-30"} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
