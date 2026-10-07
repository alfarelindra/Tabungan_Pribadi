import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import { db } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIST_DIR = path.join(__dirname, '../dist')

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Request logger sederhana
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
  console.log(`[${timestamp}] ${req.method} ${req.url}`)
  next()
})

// Endpoint Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Astaron Finance API',
    timestamp: new Date().toISOString()
  })
})

// === WALLET / AKUN DOMPET ENDPOINTS ===
// GET /api/wallets - Daftar semua dompet beserta saldo terkini
app.get('/api/wallets', (req, res) => {
  try {
    const list = db.getWallets()
    res.json({ success: true, data: list, count: list.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/wallets - Tambah akun/dompet baru
app.post('/api/wallets', (req, res) => {
  try {
    const { name, type, initialBalance, accountNumber, color, icon } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama akun/dompet wajib diisi' })
    }
    const newWallet = db.createWallet({ name, type, initialBalance, accountNumber, color, icon })
    res.status(201).json({ success: true, message: 'Dompet berhasil ditambahkan', data: newWallet })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT /api/wallets/:id - Update akun/dompet
app.put('/api/wallets/:id', (req, res) => {
  try {
    const updated = db.updateWallet(req.params.id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Akun/dompet tidak ditemukan' })
    }
    res.json({ success: true, message: 'Dompet berhasil diperbarui', data: updated })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/wallets/:id - Hapus akun/dompet
app.delete('/api/wallets/:id', (req, res) => {
  try {
    const deleted = db.deleteWallet(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Akun/dompet tidak ditemukan' })
    }
    res.json({ success: true, message: 'Dompet berhasil dihapus', data: deleted })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// === TUJUAN FINANSIAL (GOALS) ENDPOINTS ===
app.get('/api/goals', (req, res) => {
  try {
    const list = db.getGoals()
    res.json({ success: true, data: list, count: list.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

app.post('/api/goals', (req, res) => {
  try {
    const newGoal = db.createGoal(req.body)
    res.status(201).json({ success: true, message: 'Tujuan finansial berhasil dibuat', data: newGoal })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

app.put('/api/goals/:id', (req, res) => {
  try {
    const updated = db.updateGoal(req.params.id, req.body)
    if (!updated) return res.status(404).json({ success: false, message: 'Tujuan tidak ditemukan' })
    res.json({ success: true, message: 'Tujuan finansial berhasil diperbarui', data: updated })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

app.delete('/api/goals/:id', (req, res) => {
  try {
    const deleted = db.deleteGoal(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Tujuan tidak ditemukan' })
    res.json({ success: true, message: 'Tujuan finansial berhasil dihapus', data: deleted })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Alokasi Dana (Deposit) ke Tujuan Finansial (Saldo dompet asal otomatis berkurang)
app.post('/api/goals/:id/deposit', (req, res) => {
  try {
    const result = db.depositToGoal(req.params.id, req.body)
    res.json({
      success: true,
      message: 'Dana berhasil dialokasikan ke tujuan finansial.',
      data: result.goal,
      transaction: result.transaction
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Pencairan Dana (Withdraw) dari Tujuan Finansial ke Dompet Utama
app.post('/api/goals/:id/withdraw', (req, res) => {
  try {
    const result = db.withdrawFromGoal(req.params.id, req.body)
    res.json({
      success: true,
      message: 'Dana berhasil dicairkan kembali ke dompet Anda.',
      data: result.goal,
      transaction: result.transaction
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// === PENGINGAT TAGIHAN & PINJAMAN (REMINDERS) ENDPOINTS ===
app.get('/api/reminders', (req, res) => {
  try {
    const list = db.getReminders()
    res.json({ success: true, data: list, count: list.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

app.post('/api/reminders', (req, res) => {
  try {
    const newRem = db.createReminder(req.body)
    res.status(201).json({ success: true, message: 'Pengingat berhasil ditambahkan', data: newRem })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

app.put('/api/reminders/:id', (req, res) => {
  try {
    const updated = db.updateReminder(req.params.id, req.body)
    if (!updated) return res.status(404).json({ success: false, message: 'Pengingat tidak ditemukan' })
    res.json({ success: true, message: 'Pengingat berhasil diperbarui', data: updated })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

app.delete('/api/reminders/:id', (req, res) => {
  try {
    const deleted = db.deleteReminder(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Pengingat tidak ditemukan' })
    res.json({ success: true, message: 'Pengingat berhasil dihapus', data: deleted })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Bayar / Lunasi Tagihan & Pinjaman (Otomatis potong dompet)
app.post('/api/reminders/:id/pay', (req, res) => {
  try {
    const result = db.payReminder(req.params.id, req.body)
    res.json({
      success: true,
      message: 'Pembayaran berhasil dicatat dan disinkronkan ke dompet.',
      data: result.reminder,
      transaction: result.transaction
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/transactions - Daftar riwayat transaksi dengan filter & sort
app.get('/api/transactions', (req, res) => {
  try {
    const { month, type, category, walletId, search, sortBy, sortOrder } = req.query
    const list = db.getAll({ month, type, category, walletId, search, sortBy, sortOrder })
    res.json({ success: true, data: list, count: list.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/transactions/:id - Detail transaksi
app.get('/api/transactions/:id', (req, res) => {
  try {
    const item = db.getById(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' })
    }
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/transactions - Tambah transaksi baru
app.post('/api/transactions', (req, res) => {
  try {
    const { type, amount, category, date, note, walletId, fromWalletId, toWalletId } = req.body
    if (!type || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Field Jenis, Nominal, dan Tanggal wajib diisi.'
      })
    }
    const newTx = db.create({ type, amount, category, date, note, walletId, fromWalletId, toWalletId })
    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan.',
      data: newTx
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT /api/transactions/:id - Edit transaksi
app.put('/api/transactions/:id', (req, res) => {
  try {
    const updated = db.update(req.params.id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan untuk diperbarui' })
    }
    res.json({
      success: true,
      message: 'Transaksi berhasil diperbarui.',
      data: updated
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/transactions/:id - Hapus transaksi
app.delete('/api/transactions/:id', (req, res) => {
  try {
    const deleted = db.delete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan untuk dihapus' })
    }
    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus.',
      data: deleted
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/summary - Ringkasan keuangan untuk Dashboard
app.get('/api/summary', (req, res) => {
  try {
    const { month } = req.query
    const summary = db.getSummary(month)
    res.json({ success: true, data: summary })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/budget - Ambil target anggaran
app.get('/api/budget', (req, res) => {
  try {
    const settings = db.getSettings()
    res.json({ success: true, budget: settings.monthlyBudget })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/budget - Atur target anggaran
app.post('/api/budget', (req, res) => {
  try {
    const { amount } = req.body
    if (amount === undefined) {
      return res.status(400).json({ success: false, message: 'Nominal anggaran wajib diisi' })
    }
    const updated = db.updateBudget(amount)
    res.json({ success: true, message: 'Target anggaran berhasil disimpan', budget: updated.monthlyBudget })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/export - Ekspor seluruh data
app.get('/api/export', (req, res) => {
  try {
    const backup = db.exportAll()
    res.setHeader('Content-Disposition', `attachment; filename=astaron_finance_backup_${new Date().toISOString().slice(0, 10)}.json`)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(backup, null, 2))
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/import - Impor data dari file backup
app.post('/api/import', (req, res) => {
  try {
    const result = db.importAll(req.body)
    res.json({ success: true, message: `Berhasil mengimpor ${result.count} data transaksi.` })
  } catch (err) {
    res.status(400).json({ success: false, message: 'Format data impor tidak valid: ' + err.message })
  }
})

// Jika folder dist tersedia, layani aplikasi frontend statis (SPA Fallback kompatibel Express 5)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'))
    }
    next()
  })
}

// Jalankan Server
app.listen(PORT, () => {
  console.log(`✨ Astaron Finance Backend API aktif di http://localhost:${PORT}`)
})
