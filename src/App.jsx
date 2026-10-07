import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import WalletCards from './components/WalletCards'
import FinancialGoals from './components/FinancialGoals'
import SmartReminders from './components/SmartReminders'
import FinancialCharts from './components/FinancialCharts'
import BudgetOverview from './components/BudgetOverview'
import TransactionTable from './components/TransactionTable'
import TransactionModal from './components/TransactionModal'
import WalletModal from './components/WalletModal'
import GoalModal from './components/GoalModal'
import GoalFundModal from './components/GoalFundModal'
import ReminderModal from './components/ReminderModal'
import PayReminderModal from './components/PayReminderModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import DeleteWalletModal from './components/DeleteWalletModal'
import ExportImportModal from './components/ExportImportModal'
import AuthScreen from './components/AuthScreen'
import Toast from './components/Toast'
import RoseGoldEmblem3D from './components/3d/RoseGoldEmblem3D'

// === NEW MODULES (v2) ===
import NetWorthWidget from './components/NetWorthWidget'
import FinancialCalculatorModal from './components/FinancialCalculatorModal'
import BankImportModal from './components/BankImportModal'
import ReceiptScanModal from './components/ReceiptScanModal'
import RecurringTransactionsModal from './components/RecurringTransactionsModal'
import FinancialHealthScore from './components/FinancialHealthScore'
import LandingPage from './components/LandingPage'
import { useNotifications, NotificationSettingsPanel } from './components/NotificationSettings'
import { AppLockScreen, AppLockSetupModal, useAppLock } from './components/AppLock'
import { generatePdfReport } from './utils/pdfReport'

// Supabase Auth & CRUD Services
import { 
  supabase, 
  getSession, 
  onAuthStateChange, 
  signOut, 
  isSupabaseConfigured 
} from './services/supabase'

import {
  fetchWalletsFromSupabase,
  createWalletInSupabase,
  updateWalletInSupabase,
  deleteWalletInSupabase,
  fetchTransactionsFromSupabase,
  createTransactionInSupabase,
  updateTransactionInSupabase,
  deleteTransactionInSupabase,
  fetchGoalsFromSupabase,
  createGoalInSupabase,
  updateGoalInSupabase,
  deleteGoalInSupabase,
  depositToGoalInSupabase,
  withdrawFromGoalInSupabase,
  fetchRemindersFromSupabase,
  createReminderInSupabase,
  updateReminderInSupabase,
  deleteReminderInSupabase,
  payReminderInSupabase,
  fetchSummaryFromSupabase,
  saveBudgetInSupabase,
  importDataToSupabase
} from './services/supabaseApi'

// Fallback Local Express API (untuk Mode Demo / Offline)
import { 
  fetchTransactions as fetchLocalTransactions, 
  fetchSummary as fetchLocalSummary, 
  fetchWallets as fetchLocalWallets,
  fetchGoals as fetchLocalGoals,
  fetchReminders as fetchLocalReminders,
  createWallet as createLocalWallet,
  updateWallet as updateLocalWallet,
  deleteWallet as deleteLocalWallet,
  createGoal as createLocalGoal,
  updateGoal as updateLocalGoal,
  deleteGoal as deleteLocalGoal,
  depositToGoal as depositToLocalGoal,
  withdrawFromGoal as withdrawFromLocalGoal,
  createReminder as createLocalReminder,
  updateReminder as updateLocalReminder,
  deleteReminder as deleteLocalReminder,
  payReminder as payLocalReminder,
  createTransaction as createLocalTransaction, 
  updateTransaction as updateLocalTransaction, 
  deleteTransaction as deleteLocalTransaction, 
  saveBudget as saveLocalBudget,
  importData as importLocalData 
} from './services/api'

import { formatRupiah } from './utils/formatters'
import { ShieldCheck, Plus, Sparkles, RefreshCw, ArrowRightLeft, Lock, Calculator, FileText, Camera, Clock, Download, Settings, Bell } from 'lucide-react'

// Variasi Animasi Staggered Reveal Mulus untuk Dashboard
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
}

const staggerItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

export default function App() {
  const defaultMonth = new Date().toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

  // State Autentikasi Supabase & Proteksi Rute Single-User
  const [user, setUser] = useState(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // State Data Finansial
  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [goals, setGoals] = useState([])
  const [reminders, setReminders] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // State Modal Transaksi
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // State Modal Akun / Dompet
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deleteWalletTarget, setDeleteWalletTarget] = useState(null)

  // State Modal Tujuan Finansial (Goals)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalFundTarget, setGoalFundTarget] = useState(null) // { mode: 'deposit' | 'withdraw', goal }

  // State Modal Pengingat Tagihan & Pinjaman (Reminders)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [payReminderTarget, setPayReminderTarget] = useState(null)

  // State Backup / Restore
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // === NEW MODULE STATES ===
  // Landing Page
  const [showLanding, setShowLanding] = useState(true)
  // Financial Calculator
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false)
  // Bank Import
  const [isBankImportOpen, setIsBankImportOpen] = useState(false)
  // Receipt Scan
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false)
  // Recurring Transactions
  const [isRecurringOpen, setIsRecurringOpen] = useState(false)
  // App Lock
  const [isLockSetupOpen, setIsLockSetupOpen] = useState(false)
  const appLock = useAppLock()
  const [isLocked, setIsLocked] = useState(() => appLock.hasPin() && appLock.isLocked())
  // Notification settings panel
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false)
  useNotifications(reminders)

  // App lock on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && appLock.hasPin()) {
        appLock.lock()
      }
      if (document.visibilityState === 'visible' && appLock.hasPin() && appLock.isLocked()) {
        setIsLocked(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Helper Toast Feedback
  const showToast = (type, title, message) => {
    setToast({ type, title, message })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4500)
  }

  // 1. Verifikasi Status Autentikasi Supabase saat Booting
  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const session = await getSession()
        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
          }
        }
      } catch (err) {
        console.warn('Supabase auth session check notice:', err)
      } finally {
        if (isMounted) {
          setIsAuthChecking(false)
        }
      }
    }

    initializeAuth()

    const { data: authSubscription } = onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user || null)
        if (!session?.user && !isDemoMode) {
          // Kosongkan data dari memori saat logout
          setTransactions([])
          setWallets([])
          setGoals([])
          setReminders([])
          setSummary(null)
        }
      }
    })

    return () => {
      isMounted = false
      authSubscription?.subscription?.unsubscribe?.()
    }
  }, [isDemoMode])

  // 2. Load Data Finansial (Hanya jika terotentikasi atau dalam mode demo yang diizinkan)
  const loadData = useCallback(async (isSilent = false) => {
    if (!user && !isDemoMode) {
      return
    }

    try {
      if (!isSilent) setIsLoading(true)
      else setIsRefreshing(true)

      if (user) {
        // Ambil data langsung dari Supabase Database dengan RLS Aktif
        const [txData, summaryData, walletsData, goalsData, remindersData] = await Promise.all([
          fetchTransactionsFromSupabase({ month: selectedMonth }),
          fetchSummaryFromSupabase(selectedMonth),
          fetchWalletsFromSupabase(),
          fetchGoalsFromSupabase(),
          fetchRemindersFromSupabase()
        ])

        setTransactions(txData)
        setSummary(summaryData)
        setWallets(walletsData)
        setGoals(goalsData)
        setReminders(remindersData)
      } else {
        // Fallback local Express API
        const [txData, summaryData, walletsData, goalsData, remindersData] = await Promise.all([
          fetchLocalTransactions({ month: selectedMonth }),
          fetchLocalSummary(selectedMonth),
          fetchLocalWallets(),
          fetchLocalGoals(),
          fetchLocalReminders()
        ])

        setTransactions(txData)
        setSummary(summaryData)
        setWallets(walletsData)
        setGoals(goalsData)
        setReminders(remindersData)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      showToast('error', 'Gagal Memuat Data', err.message || 'Periksa koneksi Supabase atau internet Anda.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedMonth, user, isDemoMode])

  useEffect(() => {
    if (user || isDemoMode) {
      loadData()
    }
  }, [loadData, user, isDemoMode])

  // Scroll Performance Booster: Nonaktifkan pointer-events selama scroll agar 60-120 FPS bebas jank
  useEffect(() => {
    let scrollTimer = null
    const onScroll = () => {
      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling')
      }
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling')
      }, 90)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimer)
      document.body.classList.remove('is-scrolling')
    }
  }, [])

  // === HANDLER SIGN OUT ===
  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      setIsDemoMode(false)
      showToast('success', 'Berhasil Keluar', 'Sesi Anda telah ditutup dengan aman.')
    } catch (err) {
      showToast('error', 'Gagal Logout', err.message || 'Terjadi kesalahan saat menutup sesi.')
    }
  }

  // === TRANSAKSI ACTIONS (DENGAN OPTIMISTIC UI UPDATES) ===
  const handleSaveTransaction = async (formData) => {
    const numAmount = Number(formData.amount) || 0
    const prevTransactions = [...transactions]
    const prevWallets = [...wallets]
    const prevSummary = summary ? { ...summary } : null

    // 1. Optimistic Update State Lokal Secara Instan
    const tempId = formData.id || `temp-${Date.now()}`
    const isEdit = Boolean(formData.id)

    if (isEdit) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === formData.id ? { ...t, ...formData, amount: numAmount } : t))
      )
      showToast(
        'success',
        'Transaksi Diperbarui',
        `Data ${formData.category} senilai ${formatRupiah(numAmount)} diperbarui.`
      )
    } else {
      const optimisticItem = {
        ...formData,
        id: tempId,
        amount: numAmount,
        date: formData.date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        walletName: wallets.find((w) => w.id === formData.walletId)?.name || 'Dompet'
      }
      setTransactions((prev) => [optimisticItem, ...prev])

      // Optimistic balance recalculation pada dompet terkait
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === formData.walletId) {
            const delta =
              formData.type === 'income'
                ? numAmount
                : formData.type === 'expense'
                ? -numAmount
                : formData.type === 'transfer'
                ? -numAmount
                : 0
            return { ...w, currentBalance: (Number(w.currentBalance) || 0) + delta }
          }
          if (formData.type === 'transfer' && w.id === formData.toWalletId) {
            return { ...w, currentBalance: (Number(w.currentBalance) || 0) + numAmount }
          }
          return w
        })
      )

      const typeLabel =
        formData.type === 'income' ? 'Pemasukan' : formData.type === 'transfer' ? 'Transfer Saldo' : 'Pengeluaran'
      showToast(
        'success',
        'Transaksi Berhasil Dicatat',
        `${typeLabel} sebesar ${formatRupiah(numAmount)} disimpan ke portofolio.`
      )
    }

    // 2. Asynchronous Background Sync ke Supabase / Local API
    try {
      if (user) {
        if (isEdit) {
          await updateTransactionInSupabase(formData.id, formData)
        } else {
          const savedRow = await createTransactionInSupabase(formData)
          // Ganti ID sementara dengan UUID resmi dari Supabase
          setTransactions((prev) =>
            prev.map((t) => (t.id === tempId ? { ...savedRow } : t))
          )
        }
      } else {
        if (isEdit) {
          await updateLocalTransaction(formData.id, formData)
        } else {
          await createLocalTransaction(formData)
        }
      }
      // Re-sinkronisasi ringkasan secara silent untuk memastikan konsistensi metrik
      loadData(true)
    } catch (err) {
      console.error('Error syncing transaction to Supabase:', err)
      // Rollback ke state sebelumnya jika server gagal
      setTransactions(prevTransactions)
      setWallets(prevWallets)
      setSummary(prevSummary)
      showToast(
        'error',
        'Gagal Menyimpan ke Supabase',
        'Gagal menyinkronkan transaksi ke database. Periksa koneksi internet Anda.'
      )
      throw err
    }
  }

  const handleConfirmDeleteTransaction = async (id) => {
    const target = deleteTarget || transactions.find((t) => t.id === id)
    const prevTransactions = [...transactions]
    const prevWallets = [...wallets]
    const prevSummary = summary ? { ...summary } : null

    // 1. Optimistic Delete
    setDeleteTarget(null)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    showToast(
      'delete',
      'Transaksi Dihapus',
      `Transaksi ${target?.category || ''} senilai ${formatRupiah(target?.amount || 0)} telah dihapus.`
    )

    // 2. Background Sync
    try {
      if (user) {
        await deleteTransactionInSupabase(id)
      } else {
        await deleteLocalTransaction(id)
      }
      loadData(true)
    } catch (err) {
      console.error('Error deleting transaction from Supabase:', err)
      // Rollback
      setTransactions(prevTransactions)
      setWallets(prevWallets)
      setSummary(prevSummary)
      showToast('error', 'Gagal Menghapus di Supabase', 'Koneksi terputus. Data transaksi dikembalikan.')
    }
  }

  // === WALLET / DOMPET ACTIONS (OPTIMISTIC) ===
  const handleSaveWallet = async (walletData) => {
    const prevWallets = [...wallets]
    const isEdit = Boolean(walletData.id)
    const tempId = walletData.id || `temp-w-${Date.now()}`

    // Optimistic Update
    if (isEdit) {
      setWallets((prev) => prev.map((w) => (w.id === walletData.id ? { ...w, ...walletData } : w)))
      showToast('success', 'Dompet Diperbarui', `Akun/dompet "${walletData.name}" berhasil diubah.`)
    } else {
      const optimisticW = {
        ...walletData,
        id: tempId,
        currentBalance: Number(walletData.initialBalance) || 0,
        createdAt: new Date().toISOString()
      }
      setWallets((prev) => [...prev, optimisticW])
      showToast('success', 'Dompet Ditambahkan', `Akun "${walletData.name}" siap digunakan.`)
    }

    try {
      if (user) {
        if (isEdit) {
          await updateWalletInSupabase(walletData.id, walletData)
        } else {
          const savedW = await createWalletInSupabase(walletData)
          setWallets((prev) => prev.map((w) => (w.id === tempId ? savedW : w)))
        }
      } else {
        if (isEdit) await updateLocalWallet(walletData.id, walletData)
        else await createLocalWallet(walletData)
      }
      loadData(true)
    } catch (err) {
      console.error('Error saving wallet:', err)
      setWallets(prevWallets)
      showToast('error', 'Gagal Menyimpan Dompet', err.message || 'Koneksi ke Supabase gagal.')
      throw err
    }
  }

  const handleConfirmDeleteWallet = async (id) => {
    const target = deleteWalletTarget
    const prevWallets = [...wallets]

    // Optimistic Delete
    setDeleteWalletTarget(null)
    setWallets((prev) => prev.filter((w) => w.id !== id))
    showToast('delete', 'Dompet Dihapus', `Akun "${target?.name || ''}" telah dihapus.`)

    try {
      if (user) {
        await deleteWalletInSupabase(id)
      } else {
        await deleteLocalWallet(id)
      }
      loadData(true)
    } catch (err) {
      console.error('Error deleting wallet:', err)
      setWallets(prevWallets)
      showToast('error', 'Gagal Menghapus Dompet', err.message || 'Koneksi terputus.')
    }
  }

  // === GOALS ACTIONS (OPTIMISTIC) ===
  const handleSaveGoal = async (goalData) => {
    const prevGoals = [...goals]
    const isEdit = Boolean(goalData.id)
    const tempId = goalData.id || `temp-g-${Date.now()}`

    if (isEdit) {
      setGoals((prev) => prev.map((g) => (g.id === goalData.id ? { ...g, ...goalData } : g)))
      showToast('success', 'Tujuan Diperbarui', `Target "${goalData.name}" berhasil diubah.`)
    } else {
      const optimisticG = {
        ...goalData,
        id: tempId,
        currentAmount: Number(goalData.currentAmount) || 0,
        percentage: 0,
        createdAt: new Date().toISOString()
      }
      setGoals((prev) => [...prev, optimisticG])
      showToast('success', 'Tujuan Dibuat', `Target finansial baru "${goalData.name}" telah dibuat.`)
    }

    try {
      if (user) {
        if (isEdit) await updateGoalInSupabase(goalData.id, goalData)
        else {
          const saved = await createGoalInSupabase(goalData)
          setGoals((prev) => prev.map((g) => (g.id === tempId ? saved : g)))
        }
      } else {
        if (isEdit) await updateLocalGoal(goalData.id, goalData)
        else await createLocalGoal(goalData)
      }
      loadData(true)
    } catch (err) {
      console.error('Error saving goal:', err)
      setGoals(prevGoals)
      showToast('error', 'Gagal Menyimpan Target', err.message)
      throw err
    }
  }

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Hapus tujuan finansial "${goal.name}"?`)) return
    const prevGoals = [...goals]

    setGoals((prev) => prev.filter((g) => g.id !== goal.id))
    showToast('delete', 'Tujuan Dihapus', `Target finansial "${goal.name}" telah dihapus.`)

    try {
      if (user) {
        await deleteGoalInSupabase(goal.id)
      } else {
        await deleteLocalGoal(goal.id)
      }
      loadData(true)
    } catch (err) {
      console.error('Error deleting goal:', err)
      setGoals(prevGoals)
      showToast('error', 'Gagal Menghapus Target', err.message)
    }
  }

  const handleGoalFundSubmit = async ({ goalId, amount, walletId, date, note }) => {
    const numAmount = Number(amount)
    const isDeposit = goalFundTarget.mode === 'deposit'
    const prevGoals = [...goals]
    const prevWallets = [...wallets]

    // Optimistic Update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = isDeposit
            ? (Number(g.currentAmount) || 0) + numAmount
            : Math.max(0, (Number(g.currentAmount) || 0) - numAmount)
          const pct = Math.min(100, Math.round((newCurrent / (g.targetAmount || 1)) * 100))
          return { ...g, currentAmount: newCurrent, percentage: pct }
        }
        return g
      })
    )

    if (walletId) {
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === walletId) {
            const bal = Number(w.currentBalance) || 0
            return { ...w, currentBalance: isDeposit ? bal - numAmount : bal + numAmount }
          }
          return w
        })
      )
    }

    showToast(
      'success',
      isDeposit ? 'Alokasi Berhasil' : 'Pencairan Berhasil',
      `${isDeposit ? 'Alokasi' : 'Pencairan'} ${formatRupiah(numAmount)} berhasil diproses.`
    )

    try {
      if (user) {
        if (isDeposit) {
          await depositToGoalInSupabase(goalId, { amount: numAmount, walletId, notes: note })
        } else {
          await withdrawFromGoalInSupabase(goalId, { amount: numAmount, walletId, notes: note })
        }
      } else {
        if (isDeposit) {
          await depositToLocalGoal(goalId, { amount: numAmount, fromWalletId: walletId, date, note })
        } else {
          await withdrawFromLocalGoal(goalId, { amount: numAmount, toWalletId: walletId, date, note })
        }
      }
      loadData(true)
    } catch (err) {
      console.error('Error processing goal fund:', err)
      setGoals(prevGoals)
      setWallets(prevWallets)
      showToast('error', 'Gagal Memproses Dana', err.message || 'Periksa koneksi Supabase Anda.')
      throw err
    }
  }

  // === REMINDERS ACTIONS (OPTIMISTIC) ===
  const handleSaveReminder = async (remData) => {
    const prevReminders = [...reminders]
    const isEdit = Boolean(remData.id)
    const tempId = remData.id || `temp-r-${Date.now()}`

    if (isEdit) {
      setReminders((prev) => prev.map((r) => (r.id === remData.id ? { ...r, ...remData } : r)))
      showToast('success', 'Pengingat Diperbarui', `Pengingat "${remData.name}" berhasil diubah.`)
    } else {
      const optimisticR = {
        ...remData,
        id: tempId,
        isPaid: false,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      }
      setReminders((prev) => [...prev, optimisticR])
      showToast('success', 'Pengingat Ditambahkan', `Pengingat "${remData.name}" telah aktif.`)
    }

    try {
      if (user) {
        if (isEdit) await updateReminderInSupabase(remData.id, remData)
        else {
          const saved = await createReminderInSupabase(remData)
          setReminders((prev) => prev.map((r) => (r.id === tempId ? saved : r)))
        }
      } else {
        if (isEdit) await updateLocalReminder(remData.id, remData)
        else await createLocalReminder(remData)
      }
      loadData(true)
    } catch (err) {
      console.error('Error saving reminder:', err)
      setReminders(prevReminders)
      showToast('error', 'Gagal Menyimpan Pengingat', err.message)
      throw err
    }
  }

  const handleDeleteReminder = async (rem) => {
    if (!window.confirm(`Hapus pengingat "${rem.name}"?`)) return
    const prevReminders = [...reminders]

    setReminders((prev) => prev.filter((r) => r.id !== rem.id))
    showToast('delete', 'Pengingat Dihapus', `Pengingat "${rem.name}" berhasil dihapus.`)

    try {
      if (user) {
        await deleteReminderInSupabase(rem.id)
      } else {
        await deleteLocalReminder(rem.id)
      }
      loadData(true)
    } catch (err) {
      console.error('Error deleting reminder:', err)
      setReminders(prevReminders)
      showToast('error', 'Gagal Menghapus Pengingat', err.message)
    }
  }

  const handlePayReminderSubmit = async ({ reminderId, walletId, date, note }) => {
    const prevReminders = [...reminders]
    const prevWallets = [...wallets]
    const rem = reminders.find((r) => r.id === reminderId)

    // Optimistic Update
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, isPaid: true, status: 'paid' } : r))
    )

    if (rem && walletId) {
      const isReceivable = rem.kind === 'loan' && rem.loanType === 'receivable'
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === walletId) {
            const currentBal = Number(w.currentBalance) || 0
            return {
              ...w,
              currentBalance: isReceivable ? currentBal + rem.amount : currentBal - rem.amount
            }
          }
          return w
        })
      )
    }

    showToast(
      'success',
      'Pembayaran Tercatat',
      `Pembayaran "${rem?.name || 'Tagihan'}" senilai ${formatRupiah(rem?.amount || 0)} berhasil dicatat.`
    )

    try {
      if (user) {
        await payReminderInSupabase(reminderId, { walletId, note })
      } else {
        await payLocalReminder(reminderId, { walletId, date, note })
      }
      loadData(true)
    } catch (err) {
      console.error('Error paying reminder:', err)
      setReminders(prevReminders)
      setWallets(prevWallets)
      showToast('error', 'Gagal Memproses Pembayaran', err.message)
      throw err
    }
  }

  // === BUDGET ACTIONS ===
  const handleUpdateBudget = async (newBudget) => {
    try {
      if (user) {
        await saveBudgetInSupabase(newBudget)
      } else {
        await saveLocalBudget(newBudget)
      }
      setSummary((prev) => (prev ? { ...prev, budget: newBudget } : null))
      showToast('success', 'Anggaran Disimpan', `Target anggaran bulanan diatur ke ${formatRupiah(newBudget)}.`)
      loadData(true)
    } catch (err) {
      showToast('error', 'Gagal Mengubah Anggaran', err.message)
    }
  }

  // === BACKUP RESTORE ===
  const handleImportSuccess = async (importedJson) => {
    try {
      if (user) {
        await importDataToSupabase(importedJson)
      } else {
        await importLocalData(importedJson)
      }
      showToast(
        'success',
        'Pemulihan Berhasil',
        'Seluruh data portofolio, dompet, target, dan pengingat berhasil disinkronkan kembali.'
      )
      loadData(true)
      setIsExportImportModalOpen(false)
    } catch (err) {
      showToast('error', 'Gagal Mengimpor', err.message)
      throw err
    }
  }

  // =========================================================================
  // ROUTE PROTECTION & AUTH VERIFICATION STATE
  // =========================================================================
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
        <div className="fixed top-1/4 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="p-2 rounded-2xl bg-[#0B0F19] border border-[#E0A96D]/30 shadow-2xl">
            <RoseGoldEmblem3D size={85} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white flex items-center gap-2 justify-center">
              Astaron <span className="text-rose-gold-gradient">Finance</span>
            </h2>
            <p className="text-xs text-[#E0A96D] flex items-center gap-1.5 justify-center font-medium">
              <span className="w-2 h-2 rounded-full bg-[#E0A96D] animate-ping" />
              Memeriksa Sesi Aman Supabase...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // App Lock Gate
  if (isLocked) {
    return <AppLockScreen onUnlock={() => { appLock.unlock(); setIsLocked(false) }} />
  }

  // Jika Belum Terotentikasi & Tidak Dalam Mode Demo: Tampilkan Landing Page lalu AuthScreen
  if (!user && !isDemoMode) {
    // Show landing page first
    if (showLanding) {
      return (
        <>
          <LandingPage
            onLogin={() => setShowLanding(false)}
            onDemo={() => {
              setShowLanding(false)
              setIsDemoMode(true)
              showToast('info', 'Mode Demo Lokal', 'Anda menjelajahi Astaron Finance dengan penyimpanan lokal sementara.')
            }}
          />
          <Toast toast={toast} onClose={() => setToast(null)} />
        </>
      )
    }
    return (
      <>
        <AuthScreen
          onAuthSuccess={(authenticatedUser) => {
            setUser(authenticatedUser)
            showToast('success', 'Autentikasi Berhasil', `Selamat datang kembali, ${authenticatedUser.email}`)
          }}
          onContinueDemo={() => {
            setIsDemoMode(true)
            showToast('info', 'Mode Demo Lokal', 'Anda menjelajahi Astaron Finance dengan penyimpanan lokal sementara.')
          }}
          onBack={() => setShowLanding(true)}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    )
  }

  // =========================================================================
  // DASHBOARD UTAMA (TERPROTEKSI)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-[#B76E79]/30 selection:text-[#FFD1DC]">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#B76E79]/10 via-[#E0A96D]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-tl from-[#994D58]/10 via-[#B76E79]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header Sticky Navigation dengan User Badge & Logout */}
      <Header
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenNewTransaction={() => {
          setEditingTransaction(null)
          setIsTransactionModalOpen(true)
        }}
        onOpenExportImport={() => setIsExportImportModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area dengan Staggered Reveal Mulus */}
      <motion.main
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8"
      >
        {/* Welcome Executive 3D Showcase Banner */}
        <motion.div
          variants={staggerItemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141B2B] via-[#101522] to-[#18121E] border border-[#E0A96D]/25 p-5 sm:p-6 shadow-2xl shadow-black/70"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-36 bg-[radial-gradient(ellipse_at_center,rgba(224,169,109,0.12),transparent_70%)] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E0A96D]" /> 3D Micro-Interactive Dashboard
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {user ? 'Supabase RLS Active' : 'Mode Offline'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                Ringkasan Eksekutif <span className="text-rose-gold-gradient">Astaron Finance</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Kendali penuh arus kas riil, multi-dompet digital & bank, visualisasi brankas target impian 3D, serta pengingat tagihan dan pinjaman dengan perlindungan Row Level Security.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button onClick={() => loadData(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer">
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E0A96D]' : ''}`} />
                  <span>Segarkan</span>
                </button>
                <button onClick={() => { setEditingTransaction({ type: 'transfer' }); setIsTransactionModalOpen(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-[#E0A96D] hover:text-[#F3C5B5] transition-all cursor-pointer">
                  <ArrowRightLeft className="w-3.5 h-3.5" /><span>Transfer</span>
                </button>
                <button onClick={() => setIsCalcModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-violet-400 hover:text-violet-300 transition-all cursor-pointer">
                  <Calculator className="w-3.5 h-3.5" /><span>Kalkulator</span>
                </button>
                <button onClick={() => setIsBankImportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-blue-400 hover:text-blue-300 transition-all cursor-pointer">
                  <FileText className="w-3.5 h-3.5" /><span>Import Bank</span>
                </button>
                <button onClick={() => setIsReceiptScanOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-violet-400 hover:text-violet-300 transition-all cursor-pointer">
                  <Camera className="w-3.5 h-3.5" /><span>Scan Struk</span>
                </button>
                <button onClick={() => setIsRecurringOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer">
                  <Clock className="w-3.5 h-3.5" /><span>Rutin</span>
                </button>
                <button onClick={() => setIsNotifPanelOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-amber-400 hover:text-amber-300 transition-all cursor-pointer">
                  <Bell className="w-3.5 h-3.5" /><span>Notifikasi</span>
                </button>
                <button onClick={() => generatePdfReport({ summary, transactions, wallets, selectedMonth })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer">
                  <Download className="w-3.5 h-3.5" /><span>PDF</span>
                </button>
                <button onClick={() => setIsLockSetupOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#141A28] border border-slate-800 text-xs text-[#E0A96D] hover:text-[#F3C5B5] transition-all cursor-pointer">
                  <Lock className="w-3.5 h-3.5" /><span>App Lock</span>
                </button>
              </div>
            </div>

            {/* Corner Decorative 3D Low-Poly Rose Gold Emblem */}
            <div className="flex items-center gap-3.5 self-center md:self-auto shrink-0 bg-[#0A0D15]/80 p-3 rounded-2xl border border-rose-900/30 group hover:border-[#E0A96D]/50 transition-all shadow-inner">
              <div className="relative">
                <RoseGoldEmblem3D size={105} />
              </div>
              <div className="hidden sm:block text-left pr-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Astaron Wealth Coin
                </span>
                <span className="text-xs font-semibold text-rose-gold-gradient">
                  Low-Poly 3D Emblem
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Arahkan mouse untuk memutar
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 1. Summary Cards (Total Saldo, Pemasukan, Pengeluaran, Net Cashflow) */}
        <motion.div variants={staggerItemVariants}>
          <SummaryCards summary={summary} />
        </motion.div>

        {/* 1b. AI Financial Health Score (NEW) */}
        <motion.div variants={staggerItemVariants}>
          <FinancialHealthScore summary={summary} goals={goals} reminders={reminders} />
        </motion.div>

        {/* 1c. Net Worth Tracker (NEW) */}
        <motion.div variants={staggerItemVariants}>
          <NetWorthWidget wallets={wallets} />
        </motion.div>

        {/* 2. Seksi Saldo per Akun/Dompet (DANA, ShopeePay, GoPay, Bank BCA, Tunai) */}
        <motion.div variants={staggerItemVariants}>
          <WalletCards
            wallets={wallets}
            onAddNewWallet={() => {
              setEditingWallet(null)
              setIsWalletModalOpen(true)
            }}
            onEditWallet={(w) => {
              setEditingWallet(w)
              setIsWalletModalOpen(true)
            }}
            onDeleteWallet={(w) => setDeleteWalletTarget(w)}
            onTransferQuick={() => {
              setEditingTransaction({ type: 'transfer' })
              setIsTransactionModalOpen(true)
            }}
          />
        </motion.div>

        {/* 3. FITUR BARU: Tujuan Finansial (Financial Goals / Brankas Virtual) */}
        <motion.div variants={staggerItemVariants}>
          <FinancialGoals
            goals={goals}
            onAddNewGoal={() => {
              setEditingGoal(null)
              setIsGoalModalOpen(true)
            }}
            onEditGoal={(g) => {
              setEditingGoal(g)
              setIsGoalModalOpen(true)
            }}
            onDeleteGoal={handleDeleteGoal}
            onDepositGoal={(g) => setGoalFundTarget({ mode: 'deposit', goal: g })}
            onWithdrawGoal={(g) => setGoalFundTarget({ mode: 'withdraw', goal: g })}
          />
        </motion.div>

        {/* 4. FITUR BARU: Pengingat Tagihan & Pinjaman (Smart Reminders) */}
        <motion.div variants={staggerItemVariants}>
          <SmartReminders
            reminders={reminders}
            onAddNewReminder={() => {
              setEditingReminder(null)
              setIsReminderModalOpen(true)
            }}
            onEditReminder={(r) => {
              setEditingReminder(r)
              setIsReminderModalOpen(true)
            }}
            onDeleteReminder={handleDeleteReminder}
            onPayReminder={(r) => setPayReminderTarget(r)}
            onOpenNotifications={() => setIsNotifPanelOpen(true)}
          />
        </motion.div>

        {/* 5. Budget Tracking Overview */}
        <motion.div variants={staggerItemVariants}>
          <BudgetOverview
            monthlyExpense={summary?.monthlyExpense || 0}
            budget={summary?.budget || 8000000}
            categories={summary?.expenseCategories || []}
            onUpdateBudget={handleUpdateBudget}
          />
        </motion.div>

        {/* 6. Visual Charts (Cashflow Trends & Category Proportion) */}
        <motion.div variants={staggerItemVariants}>
          <FinancialCharts summary={summary} />
        </motion.div>

        {/* 7. Complete Transaction Table & Filters */}
        <motion.div variants={staggerItemVariants}>
          <TransactionTable
            transactions={transactions}
            wallets={wallets}
            onEdit={(tx) => {
              setEditingTransaction(tx)
              setIsTransactionModalOpen(true)
            }}
            onDelete={(tx) => setDeleteTarget(tx)}
          />
        </motion.div>
      </motion.main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden flex flex-col gap-2">
        <button
          onClick={() => {
            setEditingTransaction({ type: 'transfer' })
            setIsTransactionModalOpen(true)
          }}
          className="w-12 h-12 rounded-full bg-[#141B2B] text-[#E0A96D] border border-[#E0A96D]/40 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          aria-label="Transfer Saldo Antar Dompet"
          title="Transfer Antar Akun"
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setEditingTransaction(null)
            setIsTransactionModalOpen(true)
          }}
          className="w-14 h-14 rounded-full bg-rose-gold-gradient text-slate-950 flex items-center justify-center shadow-2xl glow-rose-gold active:scale-95 transition-transform cursor-pointer"
          aria-label="Catat Transaksi Baru"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A0F] py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Astaron Finance PRO</span>
            <span>&bull;</span>
            <span className="text-slate-400">Goals, Reminders &amp; Wealth Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsLockSetupOpen(true)} className="flex items-center gap-1.5 text-[#E0A96D]/70 hover:text-[#E0A96D] transition-colors cursor-pointer">
              <Lock className="w-3 h-3" /><span>App Lock</span>
            </button>
            <button onClick={() => generatePdfReport({ summary, transactions, wallets, selectedMonth })} className="flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 transition-colors cursor-pointer">
              <Download className="w-3 h-3" /><span>Laporan PDF</span>
            </button>
            <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#E0A96D]" />
              <span>Supabase BaaS &bull; RLS Protected</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* Modal Transaksi */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        initialData={editingTransaction}
        wallets={wallets}
        onClose={() => {
          setIsTransactionModalOpen(false)
          setEditingTransaction(null)
        }}
        onSubmit={handleSaveTransaction}
      />

      {/* Modal Kelola Akun / Dompet */}
      <WalletModal
        isOpen={isWalletModalOpen}
        initialData={editingWallet}
        onClose={() => {
          setIsWalletModalOpen(false)
          setEditingWallet(null)
        }}
        onSubmit={handleSaveWallet}
      />

      {/* Modal Tujuan Finansial (Goals) */}
      <GoalModal
        isOpen={isGoalModalOpen}
        initialData={editingGoal}
        onClose={() => {
          setIsGoalModalOpen(false)
          setEditingGoal(null)
        }}
        onSubmit={handleSaveGoal}
      />

      {/* Modal Tambah/Tarik Dana Tujuan Finansial */}
      <GoalFundModal
        isOpen={Boolean(goalFundTarget)}
        mode={goalFundTarget?.mode || 'deposit'}
        goal={goalFundTarget?.goal}
        wallets={wallets}
        onClose={() => setGoalFundTarget(null)}
        onSubmit={handleGoalFundSubmit}
      />

      {/* Modal Pengingat Tagihan & Pinjaman */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        initialData={editingReminder}
        wallets={wallets}
        onClose={() => {
          setIsReminderModalOpen(false)
          setEditingReminder(null)
        }}
        onSubmit={handleSaveReminder}
      />

      {/* Modal Bayar Tagihan / Pinjaman */}
      <PayReminderModal
        isOpen={Boolean(payReminderTarget)}
        reminder={payReminderTarget}
        wallets={wallets}
        onClose={() => setPayReminderTarget(null)}
        onConfirm={handlePayReminderSubmit}
      />

      {/* Modal Hapus Transaksi */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        transaction={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteTransaction}
      />

      {/* Modal Hapus Akun / Dompet */}
      <DeleteWalletModal
        isOpen={Boolean(deleteWalletTarget)}
        wallet={deleteWalletTarget}
        onClose={() => setDeleteWalletTarget(null)}
        onConfirm={handleConfirmDeleteWallet}
      />

      {/* Modal Ekspor & Impor Cadangan Data */}
      <ExportImportModal
        isOpen={isExportImportModalOpen}
        transactions={transactions}
        onClose={() => setIsExportImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* === NEW MODALS (v2) === */}
      {/* Kalkulator Finansial */}
      <FinancialCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        monthlyExpense={summary?.monthlyExpense || 0}
      />

      {/* Import Mutasi Bank */}
      <BankImportModal
        isOpen={isBankImportOpen}
        onClose={() => setIsBankImportOpen(false)}
        wallets={wallets}
        onImport={(txns) => {
          txns.forEach(tx => handleSaveTransaction(tx))
          setIsBankImportOpen(false)
          showToast('success', 'Import Berhasil', `${txns.length} transaksi berhasil diimpor.`)
        }}
      />

      {/* Scan Struk Belanja */}
      <ReceiptScanModal
        isOpen={isReceiptScanOpen}
        onClose={() => setIsReceiptScanOpen(false)}
        wallets={wallets}
        onConfirm={(txData) => {
          handleSaveTransaction(txData)
          setIsReceiptScanOpen(false)
        }}
      />

      {/* Transaksi Rutin */}
      <RecurringTransactionsModal
        isOpen={isRecurringOpen}
        onClose={() => setIsRecurringOpen(false)}
        wallets={wallets}
        onAddTransaction={(txData) => handleSaveTransaction(txData)}
      />

      {/* App Lock Setup */}
      <AppLockSetupModal
        isOpen={isLockSetupOpen}
        onClose={() => setIsLockSetupOpen(false)}
      />

      {/* Modal Pengaturan Notifikasi & Pengingat */}
      {isNotifPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={() => setIsNotifPanelOpen(false)}>
          <div className="bg-[#0D111A] border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#E0A96D]" /> Pengaturan Notifikasi &amp; WhatsApp
              </h3>
              <button onClick={() => setIsNotifPanelOpen(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer p-1">✕</button>
            </div>
            <NotificationSettingsPanel reminders={reminders} />
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
