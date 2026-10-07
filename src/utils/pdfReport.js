/**
 * PDF Report Generator using browser print API (no dependencies)
 * Generates a professional HTML print report then triggers window.print()
 */
import { formatRupiah, formatMonthName, formatDateIndo } from "./formatters"

export function generatePdfReport({ summary, transactions = [], wallets = [], selectedMonth }) {
  const monthLabel = formatMonthName(selectedMonth) || selectedMonth
  const income = summary?.monthlyIncome || 0
  const expense = summary?.monthlyExpense || 0
  const net = income - expense
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : "0"
  const totalBalance = summary?.totalBalance || 0
  const budget = summary?.budget || 0

  const topTxns = [...transactions]
    .filter(t => t.type === "expense")
    .sort((a, b) => (b.amount||0) - (a.amount||0))
    .slice(0, 10)

  const catMap = {}
  transactions.filter(t => t.type === "expense").forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + (t.amount || 0)
  })
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Astaron Finance – Laporan ${monthLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; font-size: 13px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; border-bottom: 3px solid #B76E79; padding-bottom: 20px; }
    .brand { }
    .brand h1 { font-size: 24px; font-weight: 900; color: #B76E79; letter-spacing: -0.5px; }
    .brand p { color: #888; font-size: 11px; margin-top: 2px; }
    .meta { text-align: right; }
    .meta .period { font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .meta .generated { font-size: 10px; color: #aaa; margin-top: 4px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #B76E79; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #f0e0e4; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .card { background: #faf8f9; border: 1px solid #e8dde0; border-radius: 10px; padding: 14px; }
    .card .label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .card .value { font-size: 18px; font-weight: 800; color: #1a1a2e; font-family: monospace; }
    .card .value.income { color: #16a34a; }
    .card .value.expense { color: #dc2626; }
    .card .value.net { color: ${net >= 0 ? "#16a34a" : "#dc2626"}; }
    .card .value.rose { color: #B76E79; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9f0f2; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; padding: 8px 10px; text-align: left; border-bottom: 1px solid #e8dde0; }
    td { padding: 8px 10px; border-bottom: 1px solid #f5f0f1; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    .amount { font-family: monospace; font-weight: 700; }
    .type-income { color: #16a34a; }
    .type-expense { color: #dc2626; }
    .cat-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .cat-name { width: 120px; font-size: 11px; color: #555; }
    .cat-track { flex: 1; background: #f0e0e4; border-radius: 4px; height: 8px; }
    .cat-fill { background: #B76E79; border-radius: 4px; height: 8px; }
    .cat-value { width: 90px; text-align: right; font-size: 11px; font-family: monospace; font-weight: 700; color: #1a1a2e; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8dde0; display: flex; justify-content: space-between; align-items: center; color: #aaa; font-size: 10px; }
    .badge { background: #faf0f2; border: 1px solid #e8dde0; border-radius: 6px; padding: 3px 8px; font-size: 10px; color: #B76E79; font-weight: 600; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>Astaron Finance PRO</h1>
      <p>Personal Wealth & Expense Intelligence</p>
    </div>
    <div class="meta">
      <div class="period">Laporan Bulanan – ${monthLabel}</div>
      <div class="generated">Diterbitkan: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
      <div style="margin-top:6px"><span class="badge">🔒 Supabase RLS Protected</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Ringkasan Arus Kas</div>
    <div class="grid-4">
      <div class="card"><div class="label">Total Saldo</div><div class="value rose">${formatRupiah(totalBalance)}</div></div>
      <div class="card"><div class="label">Pemasukan</div><div class="value income">${formatRupiah(income)}</div></div>
      <div class="card"><div class="label">Pengeluaran</div><div class="value expense">${formatRupiah(expense)}</div></div>
      <div class="card"><div class="label">Net Cashflow</div><div class="value net">${net >= 0 ? "+" : ""}${formatRupiah(net)}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Metrik Keuangan</div>
    <div class="grid-2">
      <div class="card"><div class="label">Savings Rate</div><div class="value">${savingsRate}%</div></div>
      <div class="card"><div class="label">Anggaran Bulanan</div><div class="value rose">${formatRupiah(budget)}</div></div>
    </div>
  </div>

  ${wallets.length > 0 ? `
  <div class="section">
    <div class="section-title">Saldo per Dompet / Rekening</div>
    <table>
      <thead><tr><th>Nama Akun</th><th>Tipe</th><th style="text-align:right">Saldo</th></tr></thead>
      <tbody>${wallets.map(w => `<tr><td>${w.name}</td><td>${w.type || "-"}</td><td style="text-align:right" class="amount">${formatRupiah(w.currentBalance || 0)}</td></tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  ${categories.length > 0 ? `
  <div class="section">
    <div class="section-title">Breakdown Pengeluaran per Kategori</div>
    ${categories.map(([cat, amt]) => {
      const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0
      return `<div class="cat-bar">
        <div class="cat-name">${cat}</div>
        <div class="cat-track"><div class="cat-fill" style="width:${pct}%"></div></div>
        <div class="cat-value">${formatRupiah(amt)}</div>
      </div>`
    }).join("")}
  </div>` : ""}

  ${topTxns.length > 0 ? `
  <div class="section">
    <div class="section-title">10 Pengeluaran Terbesar Bulan Ini</div>
    <table>
      <thead><tr><th>Tanggal</th><th>Kategori</th><th>Keterangan</th><th>Dompet</th><th style="text-align:right">Nominal</th></tr></thead>
      <tbody>${topTxns.map(t => `<tr>
        <td>${formatDateIndo(t.date)}</td>
        <td>${t.category || "-"}</td>
        <td style="max-width:180px;overflow:hidden;white-space:nowrap">${t.notes || "-"}</td>
        <td>${t.walletName || "-"}</td>
        <td style="text-align:right" class="amount type-expense">${formatRupiah(t.amount)}</td>
      </tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  <div class="footer">
    <div>Astaron Finance PRO • Laporan ${monthLabel}</div>
    <div style="display:flex;gap:8px">
      <span class="badge">🛡 RLS Protected</span>
      <span class="badge">🔐 Client-Side Only</span>
    </div>
  </div>
</body>
</html>`

  const win = window.open("", "_blank", "width=900,height=800")
  if (!win) { alert("Popup diblokir browser. Izinkan popup untuk mengunduh laporan."); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}
