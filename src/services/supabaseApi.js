import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Supabase Data Service untuk Astaron Finance
 * Menyediakan operasi CRUD penuh dengan autentikasi RLS otomatis
 */

// === WALLET / DOMPET MAPPERS & CRUD ===
export function mapWalletFromDb(row) {
  return {
    id: row.id,
    name: row.nama,
    type: row.tipe,
    initialBalance: Number(row.saldo_awal) || 0,
    currentBalance: Number(row.saldo_saat_ini) || 0,
    accountNumber: row.nomor_rekening || '',
    color: row.warna || '',
    icon: row.icon || '',
    createdAt: row.created_at
  }
}

export function mapWalletToDb(data) {
  const payload = {
    nama: data.name,
    tipe: data.type || 'bank',
    nomor_rekening: data.accountNumber || '',
    warna: data.color || '',
    icon: data.icon || ''
  }
  if (data.initialBalance !== undefined) {
    payload.saldo_awal = Number(data.initialBalance) || 0
  }
  if (data.currentBalance !== undefined) {
    payload.saldo_saat_ini = Number(data.currentBalance) || 0
  }
  return payload
}

export async function fetchWalletsFromSupabase() {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(mapWalletFromDb)
}

export async function createWalletInSupabase(walletData) {
  const payload = mapWalletToDb(walletData)
  if (payload.saldo_saat_ini === undefined) {
    payload.saldo_saat_ini = payload.saldo_awal || 0
  }

  const { data, error } = await supabase
    .from('wallets')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return mapWalletFromDb(data)
}

export async function updateWalletInSupabase(id, walletData) {
  const payload = mapWalletToDb(walletData)
  const { data, error } = await supabase
    .from('wallets')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapWalletFromDb(data)
}

export async function deleteWalletInSupabase(id) {
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// === TRANSAKSI MAPPERS & CRUD ===
export function mapTxFromDb(row, walletMap = {}) {
  const fromWallet = walletMap[row.wallet_id]
  const toWallet = walletMap[row.to_wallet_id]

  return {
    id: row.id,
    walletId: row.wallet_id,
    walletName: fromWallet?.name || 'Dompet',
    toWalletId: row.to_wallet_id,
    toWalletName: toWallet?.name || '',
    fromWalletId: row.wallet_id,
    fromWalletName: fromWallet?.name || '',
    type: row.jenis,
    amount: Number(row.nominal) || 0,
    category: row.kategori,
    date: row.tanggal,
    note: row.catatan || '',
    createdAt: row.created_at
  }
}

export function mapTxToDb(data) {
  return {
    wallet_id: data.walletId || data.fromWalletId || null,
    to_wallet_id: data.toWalletId || null,
    jenis: data.type,
    nominal: Number(data.amount),
    kategori: data.category || (data.type === 'transfer' ? 'Transfer Saldo' : 'Lainnya'),
    tanggal: data.date,
    catatan: data.note || ''
  }
}

export async function fetchTransactionsFromSupabase(params = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.month && params.month !== 'all') {
    const startDate = `${params.month}-01`
    const [year, month] = params.month.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${params.month}-${String(lastDay).padStart(2, '0')}`
    query = query.gte('tanggal', startDate).lte('tanggal', endDate)
  }

  const { data: txRows, error: txError } = await query
  if (txError) throw txError

  // Ambil data dompet untuk melengkapi walletName
  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return (txRows || []).map(r => mapTxFromDb(r, walletMap))
}

export async function createTransactionInSupabase(txData) {
  const payload = mapTxToDb(txData)
  const { data, error } = await supabase
    .from('transactions')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  // Sinkronkan saldo dompet yang terpengaruh
  await syncWalletBalanceOnTxChange(payload)

  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return mapTxFromDb(data, walletMap)
}

export async function updateTransactionInSupabase(id, txData) {
  const payload = mapTxToDb(txData)
  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return mapTxFromDb(data, walletMap)
}

export async function deleteTransactionInSupabase(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Helper rekalkulasi saldo dompet saat transaksi dibuat
async function syncWalletBalanceOnTxChange(tx) {
  try {
    if (tx.jenis === 'income' && tx.wallet_id) {
      const { data: w } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', tx.wallet_id).single()
      if (w) {
        await supabase.from('wallets').update({ saldo_saat_ini: Number(w.saldo_saat_ini) + tx.nominal }).eq('id', tx.wallet_id)
      }
    } else if (tx.jenis === 'expense' && tx.wallet_id) {
      const { data: w } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', tx.wallet_id).single()
      if (w) {
        await supabase.from('wallets').update({ saldo_saat_ini: Number(w.saldo_saat_ini) - tx.nominal }).eq('id', tx.wallet_id)
      }
    } else if (tx.jenis === 'transfer' && tx.wallet_id && tx.to_wallet_id) {
      const { data: fromW } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', tx.wallet_id).single()
      const { data: toW } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', tx.to_wallet_id).single()
      if (fromW) {
        await supabase.from('wallets').update({ saldo_saat_ini: Number(fromW.saldo_saat_ini) - tx.nominal }).eq('id', tx.wallet_id)
      }
      if (toW) {
        await supabase.from('wallets').update({ saldo_saat_ini: Number(toW.saldo_saat_ini) + tx.nominal }).eq('id', tx.to_wallet_id)
      }
    }
  } catch (err) {
    console.warn('Gagal sinkron saldo dompet otomatis:', err)
  }
}

// === TUJUAN FINANSIAL (GOALS) MAPPERS & CRUD ===
export function mapGoalFromDb(row) {
  const current = Number(row.saldo_terkumpul) || 0
  const target = Number(row.target_nominal) || 1
  const pct = Math.min(100, Math.round((current / target) * 100))
  const remaining = Math.max(0, target - current)

  let daysRemaining = null
  let isOverdue = false
  if (row.tanggal_target) {
    const today = new Date().setHours(0,0,0,0)
    const targetDate = new Date(row.tanggal_target).setHours(0,0,0,0)
    const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
    daysRemaining = diffDays
    if (diffDays < 0 && current < target) isOverdue = true
  }

  return {
    id: row.id,
    name: row.nama_tujuan,
    targetAmount: target,
    currentAmount: current,
    percentage: pct,
    remainingAmount: remaining,
    targetDate: row.tanggal_target || '',
    category: row.kategori || 'Tabungan',
    notes: row.catatan || '',
    daysRemaining,
    isOverdue,
    createdAt: row.created_at
  }
}

export function mapGoalToDb(data) {
  return {
    nama_tujuan: data.name,
    target_nominal: Number(data.targetAmount),
    saldo_terkumpul: Number(data.currentAmount) || 0,
    tanggal_target: data.targetDate || null,
    kategori: data.category || 'Tabungan',
    catatan: data.notes || ''
  }
}

export async function fetchGoalsFromSupabase() {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(mapGoalFromDb)
}

export async function createGoalInSupabase(goalData) {
  const payload = mapGoalToDb(goalData)
  const { data, error } = await supabase
    .from('financial_goals')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return mapGoalFromDb(data)
}

export async function updateGoalInSupabase(id, goalData) {
  const payload = mapGoalToDb(goalData)
  const { data, error } = await supabase
    .from('financial_goals')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapGoalFromDb(data)
}

export async function deleteGoalInSupabase(id) {
  const { error } = await supabase
    .from('financial_goals')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function depositToGoalInSupabase(id, { amount, walletId, notes }) {
  const depositAmount = Number(amount)
  if (!depositAmount || depositAmount <= 0) throw new Error('Nominal alokasi tidak valid')

  const { data: goalRow, error: goalErr } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('id', id)
    .single()
  if (goalErr) throw goalErr

  const newCollected = (Number(goalRow.saldo_terkumpul) || 0) + depositAmount

  const { data: updatedGoal, error: updateErr } = await supabase
    .from('financial_goals')
    .update({ saldo_terkumpul: newCollected })
    .eq('id', id)
    .select()
    .single()
  if (updateErr) throw updateErr

  // Kurangi saldo dompet asal jika dipilih
  if (walletId) {
    const { data: w } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', walletId).single()
    if (w) {
      await supabase.from('wallets').update({ saldo_saat_ini: Number(w.saldo_saat_ini) - depositAmount }).eq('id', walletId)
    }

    // Catat transaksi pengeluaran alokasi tabungan
    await supabase.from('transactions').insert([{
      wallet_id: walletId,
      jenis: 'expense',
      nominal: depositAmount,
      kategori: 'Tabungan & Investasi',
      tanggal: new Date().toISOString().slice(0, 10),
      catatan: `Alokasi dana ke target: ${goalRow.nama_tujuan}${notes ? ` - ${notes}` : ''}`
    }])
  }

  return mapGoalFromDb(updatedGoal)
}

export async function withdrawFromGoalInSupabase(id, { amount, walletId, notes }) {
  const withdrawAmount = Number(amount)
  if (!withdrawAmount || withdrawAmount <= 0) throw new Error('Nominal penarikan tidak valid')

  const { data: goalRow, error: goalErr } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('id', id)
    .single()
  if (goalErr) throw goalErr

  const current = Number(goalRow.saldo_terkumpul) || 0
  if (withdrawAmount > current) throw new Error('Saldo terkumpul di brankas tidak mencukupi')

  const newCollected = current - withdrawAmount
  const { data: updatedGoal, error: updateErr } = await supabase
    .from('financial_goals')
    .update({ saldo_terkumpul: newCollected })
    .eq('id', id)
    .select()
    .single()
  if (updateErr) throw updateErr

  // Tambah saldo ke dompet tujuan jika dipilih
  if (walletId) {
    const { data: w } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', walletId).single()
    if (w) {
      await supabase.from('wallets').update({ saldo_saat_ini: Number(w.saldo_saat_ini) + withdrawAmount }).eq('id', walletId)
    }

    // Catat transaksi pemasukan dari pencairan target
    await supabase.from('transactions').insert([{
      wallet_id: walletId,
      jenis: 'income',
      nominal: withdrawAmount,
      kategori: 'Pencairan Tabungan',
      tanggal: new Date().toISOString().slice(0, 10),
      catatan: `Pencairan dana dari target: ${goalRow.nama_tujuan}${notes ? ` - ${notes}` : ''}`
    }])
  }

  return mapGoalFromDb(updatedGoal)
}

// === PENGINGAT TAGIHAN & PINJAMAN (REMINDERS) MAPPERS & CRUD ===
export function mapReminderFromDb(row, walletMap = {}) {
  const today = new Date().setHours(0,0,0,0)
  const due = new Date(row.tanggal_jatuh_tempo).setHours(0,0,0,0)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  let status = 'upcoming'
  if (row.is_paid) status = 'paid'
  else if (diffDays < 0) status = 'overdue'
  else if (diffDays === 0) status = 'today'
  else if (diffDays <= 3) status = 'urgent'

  const wallet = walletMap[row.wallet_id]

  return {
    id: row.id,
    name: row.nama_pengingat,
    kind: row.jenis,
    loanType: row.sub_jenis || (row.jenis === 'loan' ? 'debt' : null),
    amount: Number(row.nominal) || 0,
    borrowDate: row.tanggal_mulai_pinjam || '',
    dueDate: row.tanggal_jatuh_tempo,
    frequency: row.frekuensi || 'Bulanan',
    walletId: row.wallet_id || '',
    walletName: wallet?.name || 'Dompet Utama',
    isPaid: Boolean(row.is_paid),
    notes: row.catatan || '',
    daysLeft: diffDays,
    status,
    createdAt: row.created_at
  }
}

export function mapReminderToDb(data) {
  return {
    nama_pengingat: data.name,
    jenis: data.kind || 'bill',
    sub_jenis: data.kind === 'loan' ? (data.loanType || 'debt') : null,
    nominal: Number(data.amount),
    tanggal_mulai_pinjam: data.borrowDate || null,
    tanggal_jatuh_tempo: data.dueDate,
    frekuensi: data.frequency || 'Bulanan',
    wallet_id: data.walletId || null,
    is_paid: Boolean(data.isPaid),
    catatan: data.notes || ''
  }
}

export async function fetchRemindersFromSupabase() {
  const { data: rows, error } = await supabase
    .from('reminders')
    .select('*')
    .order('tanggal_jatuh_tempo', { ascending: true })

  if (error) throw error

  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return (rows || []).map(r => mapReminderFromDb(r, walletMap))
}

export async function createReminderInSupabase(reminderData) {
  const payload = mapReminderToDb(reminderData)
  const { data, error } = await supabase
    .from('reminders')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return mapReminderFromDb(data, walletMap)
}

export async function updateReminderInSupabase(id, reminderData) {
  const payload = mapReminderToDb(reminderData)
  const { data, error } = await supabase
    .from('reminders')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return mapReminderFromDb(data, walletMap)
}

export async function deleteReminderInSupabase(id) {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function payReminderInSupabase(id, { walletId, note }) {
  const { data: remRow, error: remErr } = await supabase
    .from('reminders')
    .select('*')
    .eq('id', id)
    .single()
  if (remErr) throw remErr

  // Tandai pengingat sebagai lunas
  const { data: updatedRem, error: updErr } = await supabase
    .from('reminders')
    .update({ is_paid: true })
    .eq('id', id)
    .select()
    .single()
  if (updErr) throw updErr

  const targetWalletId = walletId || remRow.wallet_id
  const amount = Number(remRow.nominal) || 0

  // Potong saldo dompet jika bukan piutang, atau tambah saldo jika piutang
  if (targetWalletId) {
    const isReceivable = remRow.jenis === 'loan' && remRow.sub_jenis === 'receivable'
    const { data: w } = await supabase.from('wallets').select('saldo_saat_ini').eq('id', targetWalletId).single()
    if (w) {
      const newBal = isReceivable 
        ? Number(w.saldo_saat_ini) + amount 
        : Number(w.saldo_saat_ini) - amount
      await supabase.from('wallets').update({ saldo_saat_ini: newBal }).eq('id', targetWalletId)
    }

    // Catat transaksi otomatis di riwayat
    await supabase.from('transactions').insert([{
      wallet_id: targetWalletId,
      jenis: isReceivable ? 'income' : 'expense',
      nominal: amount,
      kategori: remRow.jenis === 'bill' ? 'Tagihan Rutin' : 'Pelunasan Hutang',
      tanggal: new Date().toISOString().slice(0, 10),
      catatan: `Pelunasan: ${remRow.nama_pengingat}${note ? ` - ${note}` : ''}`
    }])
  }

  const wallets = await fetchWalletsFromSupabase()
  const walletMap = {}
  wallets.forEach(w => { walletMap[w.id] = w })

  return mapReminderFromDb(updatedRem, walletMap)
}

// === KALKULASI EXECUTIVE SUMMARY DARI SUPABASE ===
export async function fetchSummaryFromSupabase(selectedMonth) {
  const [wallets, txs] = await Promise.all([
    fetchWalletsFromSupabase(),
    fetchTransactionsFromSupabase({ month: selectedMonth })
  ])

  // Total saldo bersih dari seluruh akun dompet
  const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.currentBalance) || 0), 0)

  // Arus kas bulan berjalan
  let monthlyIncome = 0
  let monthlyExpense = 0
  const categoryMap = {}

  txs.forEach(t => {
    if (t.type === 'income') {
      monthlyIncome += t.amount
    } else if (t.type === 'expense') {
      monthlyExpense += t.amount
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
    }
  })

  const monthlyNetSavings = monthlyIncome - monthlyExpense
  const savingsRate = monthlyIncome > 0 
    ? Math.max(0, Math.round((monthlyNetSavings / monthlyIncome) * 100))
    : 0

  const expenseCategories = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0
  })).sort((a, b) => b.amount - a.amount)

  return {
    selectedMonth,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlyNetSavings,
    savingsRate,
    budget: 8000000,
    expenseCategories,
    monthlyTrend: [
      { month: selectedMonth, income: monthlyIncome, expense: monthlyExpense }
    ]
  }
}

export async function saveBudgetInSupabase(budgetAmount) {
  // Simpan budget preference atau kembalikan nominal
  return Number(budgetAmount) || 8000000
}

export async function importDataToSupabase(payload) {
  // Jika payload memiliki wallets, import wallets
  if (Array.isArray(payload.wallets) && payload.wallets.length > 0) {
    for (const w of payload.wallets) {
      await createWalletInSupabase(w)
    }
  }
  // Jika payload memiliki transactions, import transactions
  if (Array.isArray(payload.transactions) && payload.transactions.length > 0) {
    for (const tx of payload.transactions) {
      await createTransactionInSupabase(tx)
    }
  }
  return true
}
