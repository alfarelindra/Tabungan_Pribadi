import React from 'react'
import { Plus, Building2, Smartphone, Banknote, CreditCard, Edit2, Trash2, ArrowRightLeft } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'
import TiltCard from './3d/TiltCard'
import NumberCounter from './motion/NumberCounter'

export default function WalletCards({
  wallets = [],
  onAddNewWallet,
  onEditWallet,
  onDeleteWallet,
  onTransferQuick
}) {
  const getWalletIcon = (type) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-blue-400" />
      case 'cash':
        return <Banknote className="w-5 h-5 text-[#E0A96D]" />
      case 'ewallet':
      default:
        return <Smartphone className="w-5 h-5 text-emerald-400" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'bank':
        return 'Rekening Bank'
      case 'cash':
        return 'Uang Tunai'
      case 'ewallet':
      default:
        return 'E-Wallet'
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E0A96D]/15 text-[#E0A96D]">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Saldo per Akun & Dompet</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0A96D]/15 text-[#E0A96D] border border-[#E0A96D]/30">
                {wallets.length} Dompet
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rincian riil dana di masing-masing tempat penyimpanan (ATM Bank, DANA, ShopeePay, GoPay, Tunai)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onTransferQuick && (
            <button
              onClick={onTransferQuick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141B2B] hover:bg-[#1E273D] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#E0A96D]" />
              <span>Transfer Saldo</span>
            </button>
          )}

          <button
            onClick={onAddNewWallet}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-gold-gradient bg-rose-gold-gradient-hover text-slate-950 text-xs font-bold shadow-md glow-rose-gold active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>Tambah Dompet</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Dompet dengan 3D Tilt & Specular Reflection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {wallets.map((wallet) => {
          const isNegative = wallet.currentBalance < 0

          return (
            <TiltCard
              key={wallet.id}
              maxTilt={10}
              perspective={850}
              scale={1.02}
              glare={true}
              className="h-full"
            >
              <div className="glass-card-interactive relative overflow-hidden rounded-2xl p-4.5 border border-slate-800/80 hover:border-[#E0A96D]/40 group flex flex-col justify-between min-h-[148px] h-full shadow-lg shadow-black/40">
                {/* Subtle Ambient Glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_top_right,rgba(224,169,109,0.12),transparent_70%)] pointer-events-none -mr-3 -mt-3"></div>

                {/* Top: Icon, Type Badge & Action Menu */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#090D14]/80 border border-slate-800 flex items-center justify-center shadow-inner">
                      {getWalletIcon(wallet.type)}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {getTypeLabel(wallet.type)}
                      </span>
                      <button
                        onClick={() => onEditWallet(wallet)}
                        className="p-1 rounded-md text-slate-500 hover:text-[#E0A96D] hover:bg-white/5 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                        title="Edit Akun"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {wallets.length > 1 && (
                        <button
                          onClick={() => onDeleteWallet(wallet)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Wallet Name & Account Number */}
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">
                    {wallet.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {wallet.accountNumber || 'Dompet Aktif'}
                  </p>
                </div>

                {/* Bottom: Current Balance */}
                <div className="pt-3 mt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                    Sisa Saldo
                  </span>
                  <div className={`text-base sm:text-lg font-extrabold font-mono tracking-tight ${isNegative ? 'text-rose-400' : 'text-slate-100'
                    }`}>
                    <NumberCounter value={wallet.currentBalance} duration={750} />
                  </div>
                </div>
              </div>
            </TiltCard>
          )
        })}
      </div>
    </section>
  )
}
