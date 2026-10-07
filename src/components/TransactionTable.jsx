import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft,
  Calendar, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Inbox
} from 'lucide-react'
import { formatRupiah, formatDateIndo } from '../utils/formatters'
import { motion, AnimatePresence } from 'motion/react'

export default function TransactionTable({
  transactions = [],
  wallets = [],
  onEdit,
  onDelete
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'income' | 'expense' | 'transfer'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [walletFilter, setWalletFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date') // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Dapatkan daftar kategori unik
  const availableCategories = useMemo(() => {
    const set = new Set()
    transactions.forEach(t => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set).sort()
  }, [transactions])

  // Filter & Urutkan transaksi di sisi klien
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchType = typeFilter === 'all' || t.type === typeFilter
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      const matchWallet = walletFilter === 'all' || 
        t.walletId === walletFilter || 
        t.fromWalletId === walletFilter || 
        t.toWalletId === walletFilter

      const matchSearch = searchTerm.trim() === '' || 
        (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.walletName && t.walletName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.fromWalletName && t.fromWalletName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.toWalletName && t.toWalletName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(t.amount).includes(searchTerm)

      return matchType && matchCategory && matchWallet && matchSearch
    }).sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })
  }, [transactions, searchTerm, typeFilter, categoryFilter, walletFilter, sortBy, sortOrder])

  // Paginasi
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
      
      {/* Table Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Riwayat Transaksi Keuangan</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30">
                {filteredTransactions.length} Data
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Catatan detail arus kas keluar, masuk, dan perpindahan saldo antar akun
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="bg-[#0C101A] border border-slate-800 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-rose-gold-gradient text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => { setTypeFilter('income'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => { setTypeFilter('expense'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                typeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => { setTypeFilter('transfer'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                typeFilter === 'transfer'
                  ? 'bg-gradient-to-r from-[#B76E79]/30 to-[#E0A96D]/30 text-[#E0A96D] border border-[#E0A96D]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Filter Inputs & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari transaksi, catatan, dompet..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-[#0C101A] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E0A96D] transition-colors"
            />
          </div>

          {/* Filter Dompet Spesifik */}
          <div className="relative">
            <select
              value={walletFilter}
              onChange={(e) => { setWalletFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-[#0C101A] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E0A96D] cursor-pointer"
            >
              <option value="all">Semua Akun / Dompet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-[#0C101A] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E0A96D] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown & Toggle */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-[#0C101A] border border-slate-800 focus:border-[#E0A96D] rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E0A96D] cursor-pointer"
            >
              <option value="date">Urut: Tanggal</option>
              <option value="amount">Urut: Nominal</option>
            </select>

            <button
              onClick={toggleSortOrder}
              className="p-2 rounded-xl bg-[#0C101A] hover:bg-[#161D2C] border border-slate-800 text-slate-300 hover:text-[#E0A96D] transition-colors shrink-0"
              title={`Urutan: ${sortOrder === 'asc' ? 'Menaik (A-Z)' : 'Menurun (Z-A)'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Transaction List / Table */}
      {paginatedItems.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#141B2B] text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 text-[#E0A96D]/50" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">Tidak ada transaksi ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter dompet yang dipilih.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#0C101A]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Tanggal</th>
                  <th className="py-3 px-6">Kategori & Catatan</th>
                  <th className="py-3 px-6">Sumber / Tujuan Dana</th>
                  <th className="py-3 px-6 text-center">Tipe</th>
                  <th className="py-3 px-6 text-right">Nominal</th>
                  <th className="py-3 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                <AnimatePresence initial={false}>
                  {paginatedItems.map((tx) => {
                    const isIncome = tx.type === 'income'
                    const isTransfer = tx.type === 'transfer'

                    return (
                      <motion.tr
                        key={tx.id}
                        layout="position"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.22, ease: 'easeOut' } }}
                        className="hover:bg-[#131926]/70 transition-colors group"
                      >
                        {/* Tanggal */}
                        <td className="py-3.5 px-6 whitespace-nowrap text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium">{formatDateIndo(tx.date)}</span>
                          </div>
                        </td>

                        {/* Kategori & Catatan */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              isIncome ? 'bg-emerald-400' : isTransfer ? 'bg-[#E0A96D]' : 'bg-[#B76E79]'
                            }`}></div>
                            <div>
                              <span className="font-semibold text-white tracking-wide">
                                {tx.category}
                              </span>
                              {tx.note && (
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                  {tx.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Sumber / Tujuan Dana (Wallet Badge) */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {isTransfer ? (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-[#161D2C] border border-slate-700 text-slate-300 font-medium">
                                {tx.fromWalletName}
                              </span>
                              <ArrowRightLeft className="w-3 h-3 text-[#E0A96D]" />
                              <span className="px-2 py-0.5 rounded-md bg-[#161D2C] border border-slate-700 text-slate-300 font-medium">
                                {tx.toWalletName}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#121826] border border-slate-800 text-slate-300 text-[11px] font-medium">
                                <CreditCard className="w-3 h-3 text-[#E0A96D]" />
                                <span>{tx.walletName || 'Dompet'}</span>
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Tipe Badge */}
                        <td className="py-3.5 px-6 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isTransfer
                              ? 'bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isIncome ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                            ) : isTransfer ? (
                              <ArrowRightLeft className="w-3 h-3 text-[#E0A96D]" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-rose-400" />
                            )}
                            {isIncome ? 'Masuk' : isTransfer ? 'Transfer' : 'Keluar'}
                          </span>
                        </td>

                        {/* Nominal */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap font-mono font-bold text-sm">
                          <span className={
                            isIncome 
                              ? 'text-emerald-400' 
                              : isTransfer
                              ? 'text-[#E0A96D]'
                              : 'text-[#F5C2C8]'
                          }>
                            {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatRupiah(tx.amount)}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEdit(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#E0A96D] hover:bg-[#E0A96D]/15 transition-all cursor-pointer"
                              title="Edit Transaksi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View with Seamless Collapse/Expand */}
          <div className="md:hidden divide-y divide-slate-800/60 overflow-hidden">
            <AnimatePresence initial={false}>
              {paginatedItems.map((tx) => {
                const isIncome = tx.type === 'income'
                const isTransfer = tx.type === 'transfer'

                return (
                  <motion.div
                    key={tx.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.22, ease: 'easeOut' } }}
                    className="p-4 hover:bg-[#121826] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          isIncome 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : isTransfer
                            ? 'bg-[#E0A96D]/15 text-[#E0A96D]'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : isTransfer ? (
                            <ArrowRightLeft className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{tx.category}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{formatDateIndo(tx.date)}</div>
                          
                          {/* Wallet Badge Mobile */}
                          <div className="mt-1">
                            {isTransfer ? (
                              <span className="text-[10px] text-slate-300 bg-[#161D2C] px-2 py-0.5 rounded border border-slate-700">
                                {tx.fromWalletName} ⇄ {tx.toWalletName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#E0A96D] bg-[#121826] px-2 py-0.5 rounded border border-slate-800">
                                {tx.walletName}
                              </span>
                            )}
                          </div>

                          {tx.note && (
                            <p className="text-xs text-slate-300 mt-1 italic">{tx.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${
                          isIncome 
                            ? 'text-emerald-400' 
                            : isTransfer
                            ? 'text-[#E0A96D]'
                            : 'text-[#F5C2C8]'
                        }`}>
                          {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatRupiah(tx.amount)}
                        </div>
                        
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 rounded-lg bg-[#141B2B] text-slate-400 hover:text-[#E0A96D] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(tx)}
                            className="p-1.5 rounded-lg bg-[#141B2B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div>
                Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
                <strong className="text-white">{totalPages}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-[#0C101A] border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-[#0C101A] border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}
