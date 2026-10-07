import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Camera, Sparkles, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react"
import { formatRupiah } from "../utils/formatters"

// Mock OCR - extracts numbers from image filename or simulates result
// In production, integrate Tesseract.js or Google Vision API
function mockOcrExtract(fileName) {
  // Simulate processing - return mock result
  const mockAmounts = [45000, 125000, 78500, 234000, 19000, 52000]
  const amount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)]
  const today = new Date().toISOString().slice(0, 10)
  return { amount, date: today, merchant: "Merchant dari Struk", confidence: Math.floor(70 + Math.random() * 25) }
}

export default function ReceiptScanModal({ isOpen, onClose, onConfirm, wallets = [] }) {
  const [step, setStep] = useState("upload") // upload | preview | result
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [form, setForm] = useState({ amount: "", date: "", notes: "", walletId: "", category: "Belanja" })
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStep("preview")
    setIsProcessing(true)
    // Simulate OCR processing delay
    setTimeout(() => {
      const res = mockOcrExtract(file.name)
      setResult(res)
      setForm(prev => ({ ...prev, amount: String(res.amount), date: res.date, notes: res.merchant }))
      setStep("result")
      setIsProcessing(false)
    }, 1800)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setStep("upload"); setPreviewUrl(null); setResult(null); setIsProcessing(false)
    setForm({ amount: "", date: "", notes: "", walletId: "", category: "Belanja" })
  }

  const handleSubmit = () => {
    if (!form.walletId || !form.amount) return
    onConfirm({ ...form, type: "expense", amount: Number(form.amount) })
    reset()
  }

  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }} onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-md max-h-[90vh] flex flex-col bg-[#0D1117] border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <Camera className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Scan Struk Belanja</h2>
                <p className="text-[10px] text-slate-500">Upload foto nota untuk ekstrak nominal otomatis</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {step === "upload" && (
              <>
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-slate-700 hover:border-violet-500/50 rounded-2xl py-12 flex flex-col items-center gap-3 text-slate-400 hover:text-violet-400 transition-all cursor-pointer"
                  onClick={() => fileRef.current?.click()}>
                  <ImageIcon className="w-10 h-10 opacity-50" />
                  <div className="text-center">
                    <div className="text-sm font-semibold">Klik atau drag foto struk</div>
                    <div className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP • Maks 5MB</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-xl text-xs text-violet-400">
                    <Sparkles className="w-3 h-3" /> Ekstraksi otomatis via OCR (Mock)
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <div className="text-xs text-slate-600 bg-[#0B0F19] rounded-xl p-3 border border-slate-800">
                  <strong className="text-slate-500">Catatan:</strong> Fitur OCR saat ini menggunakan data simulasi. Untuk produksi, integrasikan Tesseract.js atau Google Vision API.
                </div>
              </>
            )}
            {step === "preview" && isProcessing && (
              <div className="flex flex-col items-center gap-4 py-12">
                {previewUrl && <img src={previewUrl} alt="Struk" className="max-h-48 rounded-xl object-contain opacity-60" />}
                <div className="flex items-center gap-2 text-violet-400">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-semibold">Memproses dengan OCR...</span>
                </div>
              </div>
            )}
            {step === "result" && result && (
              <>
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Struk berhasil dianalisis! Akurasi: {result.confidence}%. Periksa dan edit jika perlu.
                </div>
                {previewUrl && <img src={previewUrl} alt="Struk" className="max-h-40 rounded-xl object-contain w-full bg-black/30" />}
                <div className="space-y-3">
                  {[
                    { label: "Nominal (Rp)", field: "amount", type: "number", ph: "0" },
                    { label: "Tanggal", field: "date", type: "date", ph: "" },
                    { label: "Keterangan / Merchant", field: "notes", type: "text", ph: "Nama toko / keterangan" },
                  ].map(({ label, field, type, ph }) => (
                    <div key={field}>
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
                      <input type={type} value={form[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} placeholder={ph}
                        className="w-full bg-[#0B0F19] border border-slate-700 focus:border-violet-500/60 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Dompet Pembayaran</label>
                    <select value={form.walletId} onChange={e => setForm(prev => ({ ...prev, walletId: e.target.value }))}
                      className="w-full bg-[#0B0F19] border border-slate-700 focus:border-violet-500/60 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
                      <option value="">-- Pilih dompet --</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={reset} className="flex-1 py-2.5 rounded-xl bg-[#131A2B] border border-slate-700 text-slate-300 text-sm font-semibold hover:border-slate-600 transition-all cursor-pointer">Ulang</button>
                  <button onClick={handleSubmit} disabled={!form.walletId || !form.amount}
                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />Catat {formatRupiah(Number(form.amount)||0)}
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
