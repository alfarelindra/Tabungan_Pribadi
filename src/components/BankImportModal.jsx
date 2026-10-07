import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Upload, FileText, ClipboardPaste, CheckCircle2, AlertCircle, ChevronRight, Sparkles } from "lucide-react"

// Deteksi format mutasi bank umum (BCA, Mandiri, e-wallet)
function parseMutasiText(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean)
  const results = []
  // Regex pola umum: tanggal - keterangan - nominal debet/kredit
  const patterns = [
    // BCA format: DD/MM/YYYY Keterangan DB CR Saldo
    /^(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([\d.,]+)\s+([\d.,]+)?\s+([\d.,]+)?$/,
    // Format tab separated
    /^(\d{2}[\/\-]\d{2}[\/\-]\d{4})\t(.+?)\t([\d.,]+)\t?([\d.,]+)?/,
    // Format dengan CR/DB label
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+(DB|CR|D|C)\s+([\d.,]+)/i,
  ]

  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(pat)
      if (m) {
        const rawDate = m[1]
        const parts = rawDate.split(/[\/\-]/)
        let isoDate = ""
        if (parts.length === 3) {
          const y = parts[2].length === 2 ? "20" + parts[2] : parts[2]
          isoDate = `${y}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`
        }
        const desc = m[2]?.trim() || ""
        const typeLabel = m[3]?.toUpperCase()
        let amount = 0, type = "expense"
        if (typeLabel === "CR" || typeLabel === "C") {
          amount = parseFloat((m[4] || "0").replace(/[.,]/g, s => s === "," && (m[4]||"").indexOf(",") === (m[4]||"").length-3 ? "." : "")) || 0
          type = "income"
        } else if (typeLabel === "DB" || typeLabel === "D") {
          amount = parseFloat((m[4] || "0").replace(/[.,]/g, s => s === "," && (m[4]||"").indexOf(",") === (m[4]||"").length-3 ? "." : "")) || 0
          type = "expense"
        } else {
          const a1 = parseFloat((m[3]||"0").replace(/\./g,"").replace(",",".")) || 0
          const a2 = parseFloat((m[4]||"0").replace(/\./g,"").replace(",",".")) || 0
          if (a2 > 0) { amount = a2; type = "income" }
          else { amount = a1; type = "expense" }
        }
        results.push({ date: isoDate || new Date().toISOString().slice(0,10), description: desc, amount, type, raw: line })
        break
      }
    }
  }
  return results
}

// Simple CSV parser
function parseCsv(text) {
  const lines = text.split("\n").filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g,""))
  return lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim().replace(/"/g,""))
    const row = {}
    headers.forEach((h, i) => row[h] = cols[i] || "")
    const date = row["tanggal"] || row["date"] || row["tgl"] || new Date().toISOString().slice(0,10)
    const desc = row["keterangan"] || row["description"] || row["desc"] || row["nama"] || "-"
    const rawAmt = row["nominal"] || row["amount"] || row["jumlah"] || row["debet"] || row["kredit"] || "0"
    const amount = parseFloat(rawAmt.replace(/[^0-9.]/g,"")) || 0
    const typeRaw = (row["tipe"] || row["type"] || row["jenis"] || "").toLowerCase()
    const type = typeRaw.includes("kredit") || typeRaw.includes("credit") || typeRaw.includes("masuk") ? "income" : "expense"
    return { date, description: desc, amount, type, raw: line }
  }).filter(r => r.amount > 0)
}

export default function BankImportModal({ isOpen, onClose, onImport, wallets = [] }) {
  const [tab, setTab] = useState("paste") // paste | csv
  const [raw, setRaw] = useState("")
  const [parsed, setParsed] = useState(null)
  const [selectedWallet, setSelectedWallet] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef()

  const handleParse = () => {
    setError("")
    setIsProcessing(true)
    setTimeout(() => {
      try {
        let results = []
        if (tab === "csv") results = parseCsv(raw)
        else results = parseMutasiText(raw)
        if (results.length === 0) {
          setError("Tidak ada transaksi terdeteksi. Pastikan format teks sesuai (tanggal, keterangan, nominal per baris).")
        } else {
          setParsed(results)
        }
      } catch (e) {
        setError("Gagal memproses: " + e.message)
      } finally { setIsProcessing(false) }
    }, 400)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setRaw(ev.target.result); setTab("csv") }
    reader.readAsText(file, "utf-8")
  }

  const handleConfirmImport = () => {
    if (!parsed || !selectedWallet) { setError("Pilih dompet tujuan terlebih dahulu."); return }
    const transactions = parsed.map(p => ({
      walletId: selectedWallet,
      type: p.type,
      category: p.type === "income" ? "Lainnya" : "Lainnya",
      amount: p.amount,
      date: p.date,
      notes: p.description,
    }))
    onImport(transactions)
    setRaw(""); setParsed(null); setSelectedWallet(""); setError("")
  }

  const toggleType = (idx) => {
    setParsed(prev => prev.map((r, i) => i === idx ? { ...r, type: r.type === "income" ? "expense" : "income" } : r))
  }

  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }} onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-xl max-h-[90vh] flex flex-col bg-[#0D1117] border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Import Mutasi Bank</h2>
                <p className="text-[10px] text-slate-500">Paste teks mutasi atau upload file CSV</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!parsed ? (
              <>
                <div className="flex gap-2">
                  {[{ id: "paste", label: "Tempel Teks", Icon: ClipboardPaste }, { id: "csv", label: "File CSV", Icon: Upload }].map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setTab(id)}
                      className={"flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer " + (tab === id ? "bg-blue-500/10 border-blue-500/40 text-blue-300" : "bg-[#0B0F19] border-slate-700 text-slate-400 hover:border-slate-600")}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>
                {tab === "csv" && (
                  <div>
                    <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500/40 rounded-2xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:text-blue-400 transition-all cursor-pointer">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-semibold">Klik untuk pilih file CSV</span>
                      <span className="text-xs text-slate-600">Format: tanggal, keterangan, nominal, tipe</span>
                    </button>
                  </div>
                )}
                <textarea value={raw} onChange={e => setRaw(e.target.value)}
                  placeholder={"Tempel teks mutasi di sini...\n\nContoh:\n01/10/2024  TRANSFER MASUK BCA     CR  5.000.000\n02/10/2024  BAYAR SHOPEE             DB  250.000"}
                  rows={8} className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500/60 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono outline-none transition-colors resize-none" />
                {error && <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
                <button onClick={handleParse} disabled={!raw.trim() || isProcessing}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                  {isProcessing ? <><Sparkles className="w-4 h-4 animate-spin" />Memproses...</> : <><ChevronRight className="w-4 h-4" />Analisis & Petakan Transaksi</>}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {parsed.length} transaksi terdeteksi. Periksa dan ubah tipe jika perlu.
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Dompet Tujuan</label>
                  <select value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500/60 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
                    <option value="">-- Pilih dompet --</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {parsed.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2">
                      <button onClick={() => toggleType(i)} className={"px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all " + (p.type === "income" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400")}>
                        {p.type === "income" ? "MASUK" : "KELUAR"}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white truncate">{p.description}</div>
                        <div className="text-[10px] text-slate-500">{p.date}</div>
                      </div>
                      <div className="text-xs font-mono font-bold text-white shrink-0">
                        {p.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
                {error && <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
                <div className="flex gap-2">
                  <button onClick={() => { setParsed(null); setError("") }} className="flex-1 py-2.5 rounded-xl bg-[#131A2B] border border-slate-700 text-slate-300 text-sm font-semibold hover:border-slate-600 transition-all cursor-pointer">Kembali</button>
                  <button onClick={handleConfirmImport} disabled={!selectedWallet}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />Impor {parsed.length} Transaksi
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
