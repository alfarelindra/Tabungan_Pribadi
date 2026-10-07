import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../data')
const DB_FILE = path.join(DATA_DIR, 'transactions.json')
const WALLETS_FILE = path.join(DATA_DIR, 'wallets.json')
const GOALS_FILE = path.join(DATA_DIR, 'goals.json')
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

// Pastikan direktori data tersedia
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Inisialisasi Akun/Dompet Default (DANA, ShopeePay, GoPay, Rekening ATM/Bank, Tunai)
const initialSeedWallets = [
  {
    id: 'w_bca',
    name: 'Rekening Bank BCA',
    type: 'bank',
    accountNumber: '8271-992-019',
    initialBalance: 20000000,
    color: 'from-blue-600 via-indigo-600 to-blue-800',
    icon: 'Building2',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'w_dana',
    name: 'DANA',
    type: 'ewallet',
    accountNumber: '0812-9988-7711',
    initialBalance: 1250000,
    color: 'from-sky-500 via-blue-600 to-indigo-600',
    icon: 'Smartphone',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'w_shopeepay',
    name: 'ShopeePay',
    type: 'ewallet',
    accountNumber: '0812-9988-7711',
    initialBalance: 850000,
    color: 'from-orange-500 via-amber-600 to-rose-600',
    icon: 'ShoppingBag',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'w_gopay',
    name: 'GoPay',
    type: 'ewallet',
    accountNumber: '0812-9988-7711',
    initialBalance: 600000,
    color: 'from-emerald-500 via-teal-600 to-cyan-700',
    icon: 'Smartphone',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'w_cash',
    name: 'Uang Tunai / Cash',
    type: 'cash',
    accountNumber: 'Dompet Fisik',
    initialBalance: 1500000,
    color: 'from-[#F3C5B5] via-[#B76E79] to-[#8E434D]',
    icon: 'Banknote',
    createdAt: '2026-10-01T00:00:00.000Z'
  }
]

// Inisialisasi Tujuan Finansial (Financial Goals / Brankas Virtual)
const initialSeedGoals = [
  {
    id: 'goal_01',
    name: 'Dana Darurat 6 Bulan',
    targetAmount: 30000000,
    currentAmount: 14500000,
    targetDate: '2027-04-30',
    category: 'Keamanan Finansial',
    color: 'from-emerald-500 via-teal-600 to-cyan-700',
    icon: 'ShieldCheck',
    notes: 'Alokasi khusus cadangan biaya hidup minimum 6 bulan',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'goal_02',
    name: 'Upgrade Laptop & Monitor Studio',
    targetAmount: 24000000,
    currentAmount: 16500000,
    targetDate: '2026-12-31',
    category: 'Produktivitas & Karir',
    color: 'from-[#F3C5B5] via-[#B76E79] to-[#8E434D]',
    icon: 'Laptop',
    notes: 'Pembaruan perangkat kerja profesional',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'goal_03',
    name: 'Liburan Musim Semi ke Jepang',
    targetAmount: 20000000,
    currentAmount: 7000000,
    targetDate: '2027-04-15',
    category: 'Traveling & Rekreasi',
    color: 'from-pink-500 via-rose-600 to-purple-700',
    icon: 'Plane',
    notes: 'Tiket pesawat, akomodasi Tokyo & Kyoto',
    createdAt: '2026-10-01T00:00:00.000Z'
  }
]

// Inisialisasi Pengingat Tagihan & Pinjaman (Reminders)
const initialSeedReminders = [
  {
    id: 'rem_01',
    kind: 'bill', // 'bill' (Tagihan Rutin) | 'loan' (Pinjaman / Hutang-Piutang)
    name: 'Langganan Replit Core & Cloud AI',
    amount: 320000,
    frequency: 'Bulanan', // 'Bulanan' | 'Tahunan' | 'Mingguan'
    dueDate: '2026-10-10',
    walletId: 'w_bca',
    isPaid: false,
    category: 'Teknologi & Software',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'rem_02',
    kind: 'bill',
    name: 'Tagihan Listrik PLN & Internet Fiber',
    amount: 680000,
    frequency: 'Bulanan',
    dueDate: '2026-10-14',
    walletId: 'w_dana',
    isPaid: false,
    category: 'Utilitas & Tagihan',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'rem_03',
    kind: 'loan',
    loanType: 'debt', // 'debt' (Hutang Saya) | 'receivable' (Piutang / Orang Meminjam ke Saya)
    name: 'Cicilan Pinjaman Modal Usaha (Pak Budi)',
    amount: 2500000,
    borrowDate: '2026-08-15',
    dueDate: '2026-10-20',
    walletId: 'w_bca',
    isPaid: false,
    notes: 'Tahap 2 dari 3 pelunasan pinjaman modal rintisan usaha',
    createdAt: '2026-08-15T00:00:00.000Z'
  },
  {
    id: 'rem_04',
    kind: 'loan',
    loanType: 'receivable',
    name: 'Piutang Rekan Kerja (Dimas)',
    amount: 1000000,
    borrowDate: '2026-09-10',
    dueDate: '2026-10-18',
    walletId: 'w_dana',
    isPaid: false,
    notes: 'Talangan sewa mobil dinas luar kota',
    createdAt: '2026-09-10T00:00:00.000Z'
  }
]

// Data awal Transaksi
const initialSeedTransactions = [
  {
    id: 'tx_seed_01',
    type: 'income',
    amount: 15000000,
    walletId: 'w_bca',
    category: 'Gaji',
    date: '2026-10-01',
    note: 'Gaji Pokok & Tunjangan Oktober',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'tx_seed_02',
    type: 'income',
    amount: 4500000,
    walletId: 'w_bca',
    category: 'Bisnis',
    date: '2026-10-03',
    note: 'Pendapatan Project Web App Freelance',
    createdAt: '2026-10-03T10:30:00.000Z',
    updatedAt: '2026-10-03T10:30:00.000Z'
  },
  {
    id: 'tx_seed_03',
    type: 'expense',
    amount: 3200000,
    walletId: 'w_bca',
    category: 'Tempat Tinggal',
    date: '2026-10-02',
    note: 'Sewa Apartemen & Maintenance Bulanan',
    createdAt: '2026-10-02T09:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z'
  },
  {
    id: 'tx_seed_04',
    type: 'expense',
    amount: 1450000,
    walletId: 'w_shopeepay',
    category: 'Belanja',
    date: '2026-10-03',
    note: 'Belanja Bulanan Supermarket Online',
    createdAt: '2026-10-03T14:15:00.000Z',
    updatedAt: '2026-10-03T14:15:00.000Z'
  },
  {
    id: 'tx_seed_05',
    type: 'expense',
    amount: 480000,
    walletId: 'w_bca',
    category: 'Tagihan',
    date: '2026-10-04',
    note: 'Tagihan Internet Fiber & Listrik PLN',
    createdAt: '2026-10-04T11:00:00.000Z',
    updatedAt: '2026-10-04T11:00:00.000Z'
  },
  {
    id: 'tx_seed_06',
    type: 'transfer',
    amount: 500000,
    fromWalletId: 'w_bca',
    toWalletId: 'w_gopay',
    category: 'Top Up E-Wallet',
    date: '2026-10-04',
    note: 'Top Up Saldo GoPay dari Rekening BCA',
    createdAt: '2026-10-04T13:00:00.000Z',
    updatedAt: '2026-10-04T13:00:00.000Z'
  },
  {
    id: 'tx_seed_07',
    type: 'expense',
    amount: 350000,
    walletId: 'w_dana',
    category: 'Transportasi',
    date: '2026-10-04',
    note: 'Pengisian Saldo e-Toll & Bensin via DANA',
    createdAt: '2026-10-04T16:20:00.000Z',
    updatedAt: '2026-10-04T16:20:00.000Z'
  },
  {
    id: 'tx_seed_08',
    type: 'expense',
    amount: 185000,
    walletId: 'w_gopay',
    category: 'Makanan',
    date: '2026-10-05',
    note: 'Dinner & Kopi Spesialti Cafe Rose Gold via GoPay',
    createdAt: '2026-10-05T19:45:00.000Z',
    updatedAt: '2026-10-05T19:45:00.000Z'
  },
  {
    id: 'tx_seed_09',
    type: 'expense',
    amount: 120000,
    walletId: 'w_cash',
    category: 'Makanan',
    date: '2026-10-05',
    note: 'Jajan Kuliner Tradisional (Uang Tunai)',
    createdAt: '2026-10-05T17:15:00.000Z',
    updatedAt: '2026-10-05T17:15:00.000Z'
  },
  {
    id: 'tx_seed_10',
    type: 'income',
    amount: 1200000,
    walletId: 'w_bca',
    category: 'Investasi',
    date: '2026-10-05',
    note: 'Dividen Saham Kuartal III ke Rekening BCA',
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-05T10:00:00.000Z'
  },
  {
    id: 'tx_seed_11',
    type: 'transfer',
    amount: 1000000,
    fromWalletId: 'w_bca',
    toWalletId: 'w_dana',
    category: 'Top Up E-Wallet',
    date: '2026-10-06',
    note: 'Transfer Saldo ke DANA',
    createdAt: '2026-10-06T09:00:00.000Z',
    updatedAt: '2026-10-06T09:00:00.000Z'
  }
]

const initialSettings = {
  monthlyBudget: 8000000,
  currency: 'IDR',
  appName: 'Astaron Finance'
}

function readJSON(filePath, fallbackData) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filePath, fallbackData)
      return fallbackData
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err)
    return fallbackData
  }
}

function writeJSON(filePath, data) {
  const tempPath = `${filePath}.${Date.now()}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8')
  fs.renameSync(tempPath, filePath)
}

let wallets = readJSON(WALLETS_FILE, initialSeedWallets)
let transactions = readJSON(DB_FILE, initialSeedTransactions)
let goals = readJSON(GOALS_FILE, initialSeedGoals)
let reminders = readJSON(REMINDERS_FILE, initialSeedReminders)
let settings = readJSON(SETTINGS_FILE, initialSettings)

export const db = {
  // === MANAJEMEN DOMPET / WALLETS ===
  getWallets() {
    return wallets.map(wallet => {
      let balance = Number(wallet.initialBalance) || 0

      transactions.forEach(tx => {
        const amt = Number(tx.amount) || 0
        if (tx.type === 'income' && tx.walletId === wallet.id) {
          balance += amt
        } else if (tx.type === 'expense' && tx.walletId === wallet.id) {
          balance -= amt
        } else if (tx.type === 'transfer') {
          if (tx.fromWalletId === wallet.id) balance -= amt
          if (tx.toWalletId === wallet.id) balance += amt
        }
      })

      return {
        ...wallet,
        currentBalance: balance
      }
    })
  },

  getWalletById(id) {
    const list = this.getWallets()
    return list.find(w => w.id === id) || null
  },

  createWallet({ name, type = 'ewallet', initialBalance = 0, accountNumber = '', color, icon }) {
    if (!name || !name.trim()) throw new Error('Nama dompet/akun wajib diisi.')
    
    const now = new Date().toISOString()
    const newWallet = {
      id: `w_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      type: type || 'ewallet',
      accountNumber: accountNumber.trim() || 'Utama',
      initialBalance: Math.max(0, Number(initialBalance) || 0),
      color: color || 'from-rose-500 via-pink-600 to-purple-700',
      icon: icon || (type === 'bank' ? 'Building2' : type === 'cash' ? 'Banknote' : 'Smartphone'),
      createdAt: now,
      updatedAt: now
    }

    wallets.push(newWallet)
    writeJSON(WALLETS_FILE, wallets)
    return this.getWalletById(newWallet.id)
  },

  updateWallet(id, updates) {
    const idx = wallets.findIndex(w => w.id === id)
    if (idx === -1) return null

    const current = wallets[idx]
    wallets[idx] = {
      ...current,
      name: updates.name ? updates.name.trim() : current.name,
      type: updates.type || current.type,
      accountNumber: updates.accountNumber !== undefined ? updates.accountNumber.trim() : current.accountNumber,
      initialBalance: updates.initialBalance !== undefined ? Math.max(0, Number(updates.initialBalance)) : current.initialBalance,
      color: updates.color || current.color,
      icon: updates.icon || current.icon,
      updatedAt: new Date().toISOString()
    }

    writeJSON(WALLETS_FILE, wallets)
    return this.getWalletById(id)
  },

  deleteWallet(id) {
    const idx = wallets.findIndex(w => w.id === id)
    if (idx === -1) return false
    
    if (wallets.length <= 1) {
      throw new Error('Minimal harus ada 1 dompet/akun aktif di sistem.')
    }

    const deleted = wallets.splice(idx, 1)[0]
    writeJSON(WALLETS_FILE, wallets)
    return deleted
  },

  // === TUJUAN FINANSIAL (FINANCIAL GOALS) ===
  getGoals() {
    const now = new Date()

    return goals.map(goal => {
      const target = Number(goal.targetAmount) || 0
      const current = Number(goal.currentAmount) || 0
      const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
      const remainingAmount = Math.max(0, target - current)

      let daysRemaining = null
      let isOverdue = false
      if (goal.targetDate) {
        const targetD = new Date(goal.targetDate + 'T23:59:59')
        const diffTime = targetD.getTime() - now.getTime()
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        isOverdue = daysRemaining < 0 && percentage < 100
      }

      return {
        ...goal,
        percentage,
        remainingAmount,
        daysRemaining,
        isCompleted: percentage >= 100,
        isOverdue
      }
    })
  },

  getGoalById(id) {
    const list = this.getGoals()
    return list.find(g => g.id === id) || null
  },

  createGoal({ name, targetAmount, targetDate, currentAmount = 0, category = 'Umum', color, icon, notes = '' }) {
    if (!name || !name.trim()) throw new Error('Nama tujuan finansial wajib diisi.')
    const numTarget = Number(targetAmount)
    if (isNaN(numTarget) || numTarget <= 0) throw new Error('Target nominal harus lebih dari 0.')

    const now = new Date().toISOString()
    const newGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: Math.max(0, Number(currentAmount) || 0),
      targetDate: targetDate || '',
      category: category.trim() || 'Tabungan',
      color: color || 'from-[#F3C5B5] via-[#B76E79] to-[#8E434D]',
      icon: icon || 'Target',
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now
    }

    goals.push(newGoal)
    writeJSON(GOALS_FILE, goals)
    return this.getGoalById(newGoal.id)
  },

  updateGoal(id, updates) {
    const idx = goals.findIndex(g => g.id === id)
    if (idx === -1) return null

    const current = goals[idx]
    goals[idx] = {
      ...current,
      name: updates.name ? updates.name.trim() : current.name,
      targetAmount: updates.targetAmount !== undefined ? Math.abs(Number(updates.targetAmount)) : current.targetAmount,
      currentAmount: updates.currentAmount !== undefined ? Math.max(0, Number(updates.currentAmount)) : current.currentAmount,
      targetDate: updates.targetDate !== undefined ? updates.targetDate : current.targetDate,
      category: updates.category ? updates.category.trim() : current.category,
      color: updates.color || current.color,
      icon: updates.icon || current.icon,
      notes: updates.notes !== undefined ? updates.notes.trim() : current.notes,
      updatedAt: new Date().toISOString()
    }

    writeJSON(GOALS_FILE, goals)
    return this.getGoalById(id)
  },

  deleteGoal(id) {
    const idx = goals.findIndex(g => g.id === id)
    if (idx === -1) return false
    const deleted = goals.splice(idx, 1)[0]
    writeJSON(GOALS_FILE, goals)
    return deleted
  },

  // Tambah Dana ke Goal (Alokasi dari salah satu dompet) -> Saldo dompet otomatis terpotong!
  depositToGoal(goalId, { amount, fromWalletId, date, note }) {
    const goalIdx = goals.findIndex(g => g.id === goalId)
    if (goalIdx === -1) throw new Error('Tujuan finansial tidak ditemukan.')
    
    const numAmount = Math.abs(Number(amount))
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Nominal alokasi harus lebih dari 0.')

    const wallet = this.getWalletById(fromWalletId)
    if (!wallet) throw new Error('Dompet sumber dana tidak valid.')

    // Update saldo terkumpul pada tujuan
    goals[goalIdx].currentAmount = (Number(goals[goalIdx].currentAmount) || 0) + numAmount
    goals[goalIdx].updatedAt = new Date().toISOString()
    writeJSON(GOALS_FILE, goals)

    // Buat transaksi pengeluaran alokasi tabungan sehingga saldo dompet asal terpotong
    const tx = this.create({
      type: 'expense',
      amount: numAmount,
      walletId: fromWalletId,
      category: 'Alokasi Tabungan',
      date: date || new Date().toISOString().slice(0, 10),
      note: note ? note.trim() : `Alokasi tabungan untuk ${goals[goalIdx].name}`
    })

    return {
      goal: this.getGoalById(goalId),
      transaction: tx
    }
  },

  // Tarik Dana dari Goal kembali ke dompet utama
  withdrawFromGoal(goalId, { amount, toWalletId, date, note }) {
    const goalIdx = goals.findIndex(g => g.id === goalId)
    if (goalIdx === -1) throw new Error('Tujuan finansial tidak ditemukan.')
    
    const numAmount = Math.abs(Number(amount))
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Nominal pencairan harus lebih dari 0.')

    const currentSaved = Number(goals[goalIdx].currentAmount) || 0
    if (numAmount > currentSaved) throw new Error('Nominal penarikan melebihi saldo yang terkumpul pada tujuan ini.')

    const wallet = this.getWalletById(toWalletId)
    if (!wallet) throw new Error('Dompet tujuan penerimaan tidak valid.')

    goals[goalIdx].currentAmount = currentSaved - numAmount
    goals[goalIdx].updatedAt = new Date().toISOString()
    writeJSON(GOALS_FILE, goals)

    // Buat transaksi pemasukan sehingga saldo dompet bertambah
    const tx = this.create({
      type: 'income',
      amount: numAmount,
      walletId: toWalletId,
      category: 'Pencairan Tabungan',
      date: date || new Date().toISOString().slice(0, 10),
      note: note ? note.trim() : `Pencairan dana dari tujuan ${goals[goalIdx].name}`
    })

    return {
      goal: this.getGoalById(goalId),
      transaction: tx
    }
  },

  // === PENGINGAT TAGIHAN & PINJAMAN (SMART REMINDERS) ===
  getReminders() {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const walletMap = new Map(wallets.map(w => [w.id, w]))

    return reminders.map(rem => {
      let daysLeft = 0
      let status = 'upcoming' // 'overdue' | 'today' | 'urgent' (1-3 hari) | 'upcoming' | 'paid'

      if (rem.isPaid) {
        status = 'paid'
      } else if (rem.dueDate) {
        if (rem.dueDate === todayStr) {
          status = 'today'
          daysLeft = 0
        } else {
          const targetD = new Date(rem.dueDate + 'T00:00:00')
          const todayD = new Date(todayStr + 'T00:00:00')
          const diffDays = Math.round((targetD.getTime() - todayD.getTime()) / (1000 * 60 * 60 * 24))
          daysLeft = diffDays
          if (diffDays < 0) {
            status = 'overdue'
          } else if (diffDays <= 3) {
            status = 'urgent'
          } else {
            status = 'upcoming'
          }
        }
      }

      return {
        ...rem,
        daysLeft,
        status,
        walletName: walletMap.get(rem.walletId)?.name || 'Dompet Utama'
      }
    }).sort((a, b) => {
      // Yang belum bayar ditaruh di depan, diurutkan tanggal jatuh tempo terdekat
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1
      return (a.dueDate || '').localeCompare(b.dueDate || '')
    })
  },

  getReminderById(id) {
    const list = this.getReminders()
    return list.find(r => r.id === id) || null
  },

  createReminder({ kind = 'bill', name, amount, frequency = 'Bulanan', dueDate, borrowDate, loanType = 'debt', walletId, category, notes = '' }) {
    if (!name || !name.trim()) throw new Error('Nama pengingat/tagihan/pinjaman wajib diisi.')
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Nominal harus lebih dari 0.')
    if (!dueDate) throw new Error('Tanggal jatuh tempo wajib diisi.')

    const now = new Date().toISOString()
    const newRem = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      kind: kind === 'loan' ? 'loan' : 'bill',
      name: name.trim(),
      amount: numAmount,
      frequency: kind === 'bill' ? (frequency || 'Bulanan') : undefined,
      dueDate,
      borrowDate: kind === 'loan' ? (borrowDate || dueDate) : undefined,
      loanType: kind === 'loan' ? (loanType || 'debt') : undefined,
      walletId: walletId || wallets[0]?.id || 'w_bca',
      category: category ? category.trim() : (kind === 'bill' ? 'Tagihan' : 'Pinjaman'),
      notes: notes.trim(),
      isPaid: false,
      createdAt: now,
      updatedAt: now
    }

    reminders.push(newRem)
    writeJSON(REMINDERS_FILE, reminders)
    return this.getReminderById(newRem.id)
  },

  updateReminder(id, updates) {
    const idx = reminders.findIndex(r => r.id === id)
    if (idx === -1) return null

    const current = reminders[idx]
    reminders[idx] = {
      ...current,
      name: updates.name ? updates.name.trim() : current.name,
      amount: updates.amount !== undefined ? Math.abs(Number(updates.amount)) : current.amount,
      frequency: updates.frequency || current.frequency,
      dueDate: updates.dueDate || current.dueDate,
      borrowDate: updates.borrowDate !== undefined ? updates.borrowDate : current.borrowDate,
      loanType: updates.loanType || current.loanType,
      walletId: updates.walletId || current.walletId,
      category: updates.category || current.category,
      notes: updates.notes !== undefined ? updates.notes.trim() : current.notes,
      isPaid: updates.isPaid !== undefined ? Boolean(updates.isPaid) : current.isPaid,
      updatedAt: new Date().toISOString()
    }

    writeJSON(REMINDERS_FILE, reminders)
    return this.getReminderById(id)
  },

  deleteReminder(id) {
    const idx = reminders.findIndex(r => r.id === id)
    if (idx === -1) return false
    const deleted = reminders.splice(idx, 1)[0]
    writeJSON(REMINDERS_FILE, reminders)
    return deleted
  },

  // Bayar Tagihan / Lunasi Pinjaman -> Otomatis potong dompet & buat transaksi!
  payReminder(id, { walletId, date, note }) {
    const idx = reminders.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Pengingat tidak ditemukan.')

    const rem = reminders[idx]
    const chosenWallet = walletId || rem.walletId || wallets[0]?.id

    // Tentukan tipe transaksi:
    // Jika bill atau hutang (saya bayar) -> expense
    // Jika piutang (orang bayar ke saya) -> income
    const isReceivable = rem.kind === 'loan' && rem.loanType === 'receivable'
    const txType = isReceivable ? 'income' : 'expense'
    const categoryName = rem.kind === 'bill' ? 'Tagihan' : isReceivable ? 'Pelunasan Piutang' : 'Pembayaran Hutang'

    const tx = this.create({
      type: txType,
      amount: rem.amount,
      walletId: chosenWallet,
      category: categoryName,
      date: date || new Date().toISOString().slice(0, 10),
      note: note ? note.trim() : `Pelunasan: ${rem.name}`
    })

    // Tandai sudah dibayar
    reminders[idx].isPaid = true
    reminders[idx].paidAt = new Date().toISOString()
    reminders[idx].updatedAt = new Date().toISOString()
    writeJSON(REMINDERS_FILE, reminders)

    return {
      reminder: this.getReminderById(id),
      transaction: tx
    }
  },

  // === TRANSAKSI ===
  getAll({ month, type, category, walletId, search, sortBy = 'date', sortOrder = 'desc' } = {}) {
    const walletMap = new Map(wallets.map(w => [w.id, w]))

    let result = transactions.map(tx => {
      let walletName = '-'
      let fromWalletName = ''
      let toWalletName = ''

      if (tx.type === 'transfer') {
        fromWalletName = walletMap.get(tx.fromWalletId)?.name || 'Akun Asal'
        toWalletName = walletMap.get(tx.toWalletId)?.name || 'Akun Tujuan'
      } else if (tx.walletId) {
        walletName = walletMap.get(tx.walletId)?.name || 'Dompet'
      }

      return {
        ...tx,
        walletName,
        fromWalletName,
        toWalletName
      }
    })

    if (month && month !== 'all') {
      result = result.filter(item => item.date.startsWith(month))
    }

    if (type && type !== 'all') {
      result = result.filter(item => item.type === type)
    }

    if (category && category !== 'all') {
      result = result.filter(item => item.category.toLowerCase() === category.toLowerCase())
    }

    if (walletId && walletId !== 'all') {
      result = result.filter(item => 
        item.walletId === walletId || 
        item.fromWalletId === walletId || 
        item.toWalletId === walletId
      )
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase()
      result = result.filter(item => 
        (item.note && item.note.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.walletName && item.walletName.toLowerCase().includes(q)) ||
        (item.fromWalletName && item.fromWalletName.toLowerCase().includes(q)) ||
        (item.toWalletName && item.toWalletName.toLowerCase().includes(q)) ||
        item.amount.toString().includes(q)
      )
    }

    result.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA === dateB) {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    return result
  },

  getById(id) {
    return transactions.find(item => item.id === id) || null
  },

  create({ type, amount, category, date, note = '', walletId, fromWalletId, toWalletId }) {
    if (!type || !amount || !date) {
      throw new Error('Field type, amount, dan date wajib diisi.')
    }
    const numAmount = Math.abs(Number(amount))
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Nominal uang harus berupa angka positif.')
    }

    if (type === 'transfer') {
      if (!fromWalletId || !toWalletId) {
        throw new Error('Sumber dompet asal dan dompet tujuan wajib dipilih untuk transfer.')
      }
      if (fromWalletId === toWalletId) {
        throw new Error('Dompet asal dan tujuan tidak boleh sama.')
      }
    } else {
      if (!walletId) {
        walletId = wallets[0]?.id || 'w_bca'
      }
    }

    const now = new Date().toISOString()
    const newTx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: type === 'income' ? 'income' : type === 'transfer' ? 'transfer' : 'expense',
      amount: numAmount,
      category: category ? category.trim() : (type === 'transfer' ? 'Transfer Antar Akun' : 'Lainnya'),
      date,
      note: note.trim(),
      walletId: type !== 'transfer' ? walletId : undefined,
      fromWalletId: type === 'transfer' ? fromWalletId : undefined,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      createdAt: now,
      updatedAt: now
    }

    transactions.unshift(newTx)
    writeJSON(DB_FILE, transactions)
    return newTx
  },

  update(id, updates) {
    const index = transactions.findIndex(item => item.id === id)
    if (index === -1) return null

    const current = transactions[index]
    const updated = {
      ...current,
      type: updates.type || current.type,
      amount: updates.amount !== undefined ? Math.abs(Number(updates.amount)) : current.amount,
      category: updates.category !== undefined ? updates.category.trim() : current.category,
      date: updates.date !== undefined ? updates.date : current.date,
      note: updates.note !== undefined ? updates.note.trim() : current.note,
      walletId: updates.type === 'transfer' ? undefined : (updates.walletId || current.walletId),
      fromWalletId: updates.type === 'transfer' ? (updates.fromWalletId || current.fromWalletId) : undefined,
      toWalletId: updates.type === 'transfer' ? (updates.toWalletId || current.toWalletId) : undefined,
      updatedAt: new Date().toISOString()
    }

    transactions[index] = updated
    writeJSON(DB_FILE, transactions)
    return updated
  },

  delete(id) {
    const index = transactions.findIndex(item => item.id === id)
    if (index === -1) return false
    const deleted = transactions.splice(index, 1)[0]
    writeJSON(DB_FILE, transactions)
    return deleted
  },

  // Ringkasan Finansial untuk Dashboard
  getSummary(month) {
    const currentMonth = month || new Date().toISOString().slice(0, 7)
    const walletsWithBalance = this.getWallets()
    const goalsList = this.getGoals()
    const remindersList = this.getReminders()

    // Total Saldo Keseluruhan
    const totalBalance = walletsWithBalance.reduce((acc, w) => acc + w.currentBalance, 0)

    // Total Saldo Terkumpul di Goals
    const totalSavedInGoals = goalsList.reduce((acc, g) => acc + (Number(g.currentAmount) || 0), 0)

    // Tagihan & Pinjaman Mendatang yang belum dibayar
    const unpaidReminders = remindersList.filter(r => !r.isPaid)
    const upcomingBillsTotal = unpaidReminders
      .filter(r => r.kind === 'bill' || (r.kind === 'loan' && r.loanType === 'debt'))
      .reduce((acc, r) => acc + r.amount, 0)

    // Transaksi Bulan Ini
    const monthlyTransactions = transactions.filter(tx => tx.date.startsWith(currentMonth))
    let monthlyIncome = 0
    let monthlyExpense = 0
    let monthlyTransfer = 0
    const categoryExpenseMap = {}

    monthlyTransactions.forEach(tx => {
      if (tx.type === 'income') {
        monthlyIncome += tx.amount
      } else if (tx.type === 'expense') {
        monthlyExpense += tx.amount
        categoryExpenseMap[tx.category] = (categoryExpenseMap[tx.category] || 0) + tx.amount
      } else if (tx.type === 'transfer') {
        monthlyTransfer += tx.amount
      }
    })

    const monthlyNetSavings = monthlyIncome - monthlyExpense
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlyNetSavings / monthlyIncome) * 100) : 0

    // Kategori Pengeluaran
    const expenseCategories = Object.entries(categoryExpenseMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)

    // Tren 6 Bulan
    const monthlyTrend = []
    const baseDate = new Date(`${currentMonth}-01T00:00:00Z`)
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1)
      const yearMonth = d.toISOString().slice(0, 7)
      const monthLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })

      let inc = 0
      let exp = 0
      transactions.forEach(t => {
        if (t.date.startsWith(yearMonth)) {
          if (t.type === 'income') inc += t.amount
          else if (t.type === 'expense') exp += t.amount
        }
      })

      monthlyTrend.push({
        monthKey: yearMonth,
        label: monthLabel,
        income: inc,
        expense: exp,
        net: inc - exp
      })
    }

    // Daily breakdown bulan ini
    const daysInMonthMap = {}
    monthlyTransactions.forEach(tx => {
      const day = tx.date
      if (!daysInMonthMap[day]) {
        daysInMonthMap[day] = { date: day, income: 0, expense: 0 }
      }
      if (tx.type === 'income') daysInMonthMap[day].income += tx.amount
      else if (tx.type === 'expense') daysInMonthMap[day].expense += tx.amount
    })
    const dailyTrend = Object.values(daysInMonthMap).sort((a, b) => a.date.localeCompare(b.date))

    return {
      selectedMonth: currentMonth,
      totalBalance,
      totalSavedInGoals,
      upcomingBillsTotal,
      unpaidRemindersCount: unpaidReminders.length,
      monthlyIncome,
      monthlyExpense,
      monthlyTransfer,
      monthlyNetSavings,
      savingsRate,
      transactionCount: monthlyTransactions.length,
      wallets: walletsWithBalance,
      goals: goalsList,
      reminders: remindersList,
      expenseCategories,
      monthlyTrend,
      dailyTrend,
      budget: settings.monthlyBudget
    }
  },

  getSettings() {
    return settings
  },

  updateBudget(monthlyBudget) {
    const num = Math.abs(Number(monthlyBudget))
    if (isNaN(num)) throw new Error('Budget tidak valid.')
    settings.monthlyBudget = num
    writeJSON(SETTINGS_FILE, settings)
    return settings
  },

  exportAll() {
    return {
      appName: 'Astaron Finance',
      exportDate: new Date().toISOString(),
      settings,
      wallets: this.getWallets(),
      goals: this.getGoals(),
      reminders: this.getReminders(),
      transactions
    }
  },

  importAll(data) {
    if (Array.isArray(data.wallets)) {
      wallets = data.wallets
      writeJSON(WALLETS_FILE, wallets)
    }
    if (Array.isArray(data.goals)) {
      goals = data.goals
      writeJSON(GOALS_FILE, goals)
    }
    if (Array.isArray(data.reminders)) {
      reminders = data.reminders
      writeJSON(REMINDERS_FILE, reminders)
    }
    if (Array.isArray(data.transactions)) {
      transactions = data.transactions
      writeJSON(DB_FILE, transactions)
    }
    if (data.settings) {
      settings = { ...settings, ...data.settings }
      writeJSON(SETTINGS_FILE, settings)
    }
    return { 
      success: true, 
      count: transactions.length, 
      walletCount: wallets.length,
      goalCount: goals.length,
      reminderCount: reminders.length
    }
  }
}
