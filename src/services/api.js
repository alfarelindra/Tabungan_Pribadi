const API_BASE = '/api'

export async function fetchTransactions(params = {}) {
  const query = new URLSearchParams()
  if (params.month) query.set('month', params.month)
  if (params.type) query.set('type', params.type)
  if (params.category) query.set('category', params.category)
  if (params.walletId) query.set('walletId', params.walletId)
  if (params.search) query.set('search', params.search)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortOrder) query.set('sortOrder', params.sortOrder)

  const res = await fetch(`${API_BASE}/transactions?${query.toString()}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memuat transaksi')
  return json.data
}

export async function fetchSummary(month) {
  const query = month ? `?month=${month}` : ''
  const res = await fetch(`${API_BASE}/summary${query}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memuat ringkasan')
  return json.data
}

export async function createTransaction(data) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menyimpan transaksi')
  return json.data
}

export async function updateTransaction(id, data) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui transaksi')
  return json.data
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus transaksi')
  return json.data
}

// === WALLET / AKUN DOMPET APIS ===
export async function fetchWallets() {
  const res = await fetch(`${API_BASE}/wallets`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memuat daftar dompet')
  return json.data
}

export async function createWallet(data) {
  const res = await fetch(`${API_BASE}/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menambahkan dompet')
  return json.data
}

export async function updateWallet(id, data) {
  const res = await fetch(`${API_BASE}/wallets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui dompet')
  return json.data
}

export async function deleteWallet(id) {
  const res = await fetch(`${API_BASE}/wallets/${id}`, {
    method: 'DELETE'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus dompet')
  return json.data
}

// === TUJUAN FINANSIAL (GOALS) APIS ===
export async function fetchGoals() {
  const res = await fetch(`${API_BASE}/goals`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memuat tujuan finansial')
  return json.data
}

export async function createGoal(data) {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal membuat tujuan finansial')
  return json.data
}

export async function updateGoal(id, data) {
  const res = await fetch(`${API_BASE}/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui tujuan finansial')
  return json.data
}

export async function deleteGoal(id) {
  const res = await fetch(`${API_BASE}/goals/${id}`, {
    method: 'DELETE'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus tujuan finansial')
  return json.data
}

export async function depositToGoal(id, data) {
  const res = await fetch(`${API_BASE}/goals/${id}/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal mengalokasikan dana')
  return json
}

export async function withdrawFromGoal(id, data) {
  const res = await fetch(`${API_BASE}/goals/${id}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal mencairkan dana')
  return json
}

// === PENGINGAT TAGIHAN & PINJAMAN (REMINDERS) APIS ===
export async function fetchReminders() {
  const res = await fetch(`${API_BASE}/reminders`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memuat pengingat')
  return json.data
}

export async function createReminder(data) {
  const res = await fetch(`${API_BASE}/reminders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal membuat pengingat')
  return json.data
}

export async function updateReminder(id, data) {
  const res = await fetch(`${API_BASE}/reminders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui pengingat')
  return json.data
}

export async function deleteReminder(id) {
  const res = await fetch(`${API_BASE}/reminders/${id}`, {
    method: 'DELETE'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus pengingat')
  return json.data
}

export async function payReminder(id, data) {
  const res = await fetch(`${API_BASE}/reminders/${id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memproses pembayaran pengingat')
  return json
}

export async function fetchBudget() {
  const res = await fetch(`${API_BASE}/budget`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal memuat anggaran')
  return json.budget
}

export async function saveBudget(amount) {
  const res = await fetch(`${API_BASE}/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal menyimpan anggaran')
  return json.budget
}

export function exportDataUrl() {
  return `${API_BASE}/export`
}

export async function importData(jsonData) {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Gagal mengimpor data')
  return json
}
