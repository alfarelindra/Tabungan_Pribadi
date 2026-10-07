export function formatRupiah(amount) {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num)
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function formatMonthName(yearMonthStr) {
  if (!yearMonthStr) return '-'
  const [year, month] = yearMonthStr.split('-')
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export const CATEGORIES = {
  income: [
    { name: 'Gaji', icon: 'Briefcase', color: 'from-amber-400 to-rose-400' },
    { name: 'Bisnis', icon: 'TrendingUp', color: 'from-rose-400 to-pink-500' },
    { name: 'Investasi', icon: 'PieChart', color: 'from-emerald-400 to-teal-500' },
    { name: 'Bonus', icon: 'Award', color: 'from-yellow-400 to-amber-500' },
    { name: 'Hadiah', icon: 'Gift', color: 'from-purple-400 to-pink-400' },
    { name: 'Lainnya', icon: 'MoreHorizontal', color: 'from-slate-400 to-slate-500' }
  ],
  expense: [
    { name: 'Makanan', icon: 'Utensils', color: 'from-orange-400 to-rose-400' },
    { name: 'Transportasi', icon: 'Car', color: 'from-blue-400 to-indigo-500' },
    { name: 'Belanja', icon: 'ShoppingBag', color: 'from-pink-400 to-rose-500' },
    { name: 'Tempat Tinggal', icon: 'Home', color: 'from-purple-400 to-indigo-500' },
    { name: 'Tagihan', icon: 'Zap', color: 'from-yellow-400 to-amber-600' },
    { name: 'Hiburan', icon: 'Film', color: 'from-violet-400 to-purple-600' },
    { name: 'Kesehatan', icon: 'HeartPulse', color: 'from-rose-500 to-red-600' },
    { name: 'Pendidikan', icon: 'GraduationCap', color: 'from-cyan-400 to-blue-500' },
    { name: 'Lainnya', icon: 'MoreHorizontal', color: 'from-slate-400 to-slate-500' }
  ]
}
