import React, { useState } from 'react'
import { X, Download, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react'
import { exportDataUrl } from '../services/api'

export default function ExportImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  transactions = []
}) {
  const [importStatus, setImportStatus] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  // Unduh CSV langsung di klien
  const handleExportCSV = () => {
    if (!transactions.length) return

    const headers = ['ID', 'Tipe', 'Kategori', 'Nominal', 'Tanggal', 'Catatan']
    const rows = transactions.map(t => [
      t.id,
      t.type,
      `"${t.category}"`,
      t.amount,
      t.date,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `astaron_finance_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle file import JSON
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setImportStatus(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result)
        await onImportSuccess(json)
        setImportStatus({ type: 'success', message: 'Data cadangan berhasil dipulihkan!' })
      } catch (err) {
        setImportStatus({ type: 'error', message: 'File tidak valid: ' + err.message })
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F1420] border border-[#B76E79]/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-[#121927]">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Cadangan & Portabilitas Data
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola pencadangan arsip dan pemulihan data keuangan Anda
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {importStatus && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {importStatus.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0A96D]">
              Ekspor Data (Backup)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={exportDataUrl()}
                download
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#131926] hover:bg-[#1C2538] border border-slate-800 text-slate-200 text-xs font-semibold transition-all hover:border-[#E0A96D]/40 text-center"
              >
                <Download className="w-4 h-4 text-[#E0A96D]" />
                <span>Format JSON</span>
              </a>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#131926] hover:bg-[#1C2538] border border-slate-800 text-slate-200 text-xs font-semibold transition-all hover:border-[#E0A96D]/40 text-center"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Format CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0A96D]">
              Impor Data (Restore)
            </h4>
            <p className="text-[11px] text-slate-400">
              Unggah file cadangan JSON Astaron Finance untuk memulihkan seluruh riwayat transaksi.
            </p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-[#B76E79]/50 rounded-xl p-5 bg-[#0A0E17] cursor-pointer transition-colors group">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-[#E0A96D] transition-colors mb-2" />
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                {isProcessing ? 'Memproses File...' : 'Klik untuk memilih file JSON'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Maksimal 10 MB (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>

        </div>

      </div>
    </div>
  )
}
