# ✨ Astaron Finance — Luxury Wealth, Goals & Reminders Intelligence

Aplikasi web pencatat keuangan pribadi modern, elegan, dan siap pakai (*ready-to-use*) dengan palet visual **Dark Mode & Rose Gold Accent**. Dilengkapi fungsionalitas penuh:
- 💳 **Pelacakan Multi-Akun / Dompet** (DANA, ShopeePay, GoPay, Rekening Bank/ATM, Tunai)
- 🎯 **Tujuan Finansial / Brankas Virtual (Financial Goals)** dengan alokasi otomatis dari dompet utama
- 🔔 **Pengingat Tagihan & Pinjaman (Smart Reminders)** dengan badge status jatuh tempo cerdas
- 📊 **Visualisasi Tren Arus Kas & Anggaran Cerdas**
- 💾 **Penyimpanan Persisten & Ekspor / Impor JSON / CSV**

---

## 🎯 1. Fitur Tujuan Finansial (Financial Goals / Brankas Virtual)

- **Target Tabungan Impian**: Rencanakan target masa depan seperti "Dana Darurat 6 Bulan", "Upgrade Laptop & Monitor Studio", atau "Liburan ke Jepang".
- **Card Interaktif & Progress Bar**: Menampilkan persentase pencapaian, saldo terkumpul, sisa target yang harus dipenuhi, dan sisa hari hingga tenggat waktu (*deadline*).
- **Alokasi Dana Otomatis ("Tambah Dana")**:
  - Mengalokasikan dana dari salah satu dompet utama (misal: Bank BCA, GoPay, DANA) langsung ke tujuan finansial.
  - **Saldo dompet asal otomatis terpotong** dan dicatat dalam histori riwayat sebagai pengeluaran alokasi tabungan.
- **Pencairan Dana ("Tarik Dana")**:
  - Mencairkan kembali dana yang terkumpul ke dompet utama jika diperlukan.
- **Manajemen CRUD Target**: Buat, edit nominal/tanggal, dan hapus tujuan finansial.

---

## 🔔 2. Fitur Pengingat Tagihan & Pinjaman (Smart Reminders)

- **Tagihan Rutin (Recurring Bills)**:
  - Catat tagihan rutin langganan (misal: Replit, Netflix, Spotify) dan utilitas (Listrik PLN, WiFi).
  - Tentukan nominal, frekuensi (Bulanan, Tahunan, Mingguan), tanggal jatuh tempo, dan dompet pembayaran default.
- **Pinjaman & Hutang-Piutang (Loans & Debts)**:
  - Mendukung dua jenis: **Hutang** (Saya Meminjam) dan **Piutang** (Orang Meminjam ke Saya).
  - Dilengkapi **Tanggal Peminjaman Awal** dan **Tanggal Jatuh Tempo Pembayaran**.
- **Badge Status Jatuh Tempo Cerdas**:
  - 🚨 **"Jatuh Tempo Hari Ini!"** (Merah rose dengan animasi denyut)
  - ⚠️ **"X Hari Lagi"** (Amber gold / peringatan segera)
  - 🛑 **"Terlewat X Hari"** (Overdue alert)
  - ✅ **"Lunas / Terbayar"** (Emerald green)
- **Tombol Cepat "Bayar Sekarang / Lunasi"**:
  - Membuka dialog pembayaran instan untuk memilih dompet pemotongan dana (atau dompet penerima dana jika piutang).
  - Transaksi otomatis dicatat ke riwayat dan saldo dompet langsung tersinkronisasi.

---

## 💳 3. Fitur Multi-Akun / Dompet (Wallets)

- **Seksi Saldo per Akun/Dompet**:
  - Menampilkan sisa uang secara spesifik di masing-masing tempat penyimpanan (ATM BCA, DANA, ShopeePay, GoPay, Uang Tunai).
  - Menghitung saldo secara dinamis berdasarkan seluruh arus kas masuk, keluar, dan transfer.
- **Transfer Antar Akun**:
  - Memindahkan dana dari satu dompet ke dompet lain (misal: BCA ke GoPay) tanpa memengaruhi total kekayaan bersih (*Net Worth*).
- **Manajemen Dompet**: Tambah dompet baru, ubah saldo awal, pilih warna gradien kartu, dan hapus dompet.

---

## 📊 4. Dashboard Eksekutif & Visualisasi Data

- **Kartu Metrik Utama**: Total Saldo Keseluruhan (akumulasi seluruh dompet), Total Pemasukan, Total Pengeluaran, dan Rasio Tabungan Bulanan.
- **Grafik Tren 6 Bulan**: Bar chart ganda komparasi pemasukan vs pengeluaran per bulan dengan hover tooltip detail.
- **Tren Harian**: Rincian arus kas harian per tanggal pada bulan terpilih.
- **Proporsi Pengeluaran**: Distribusi belanja per pos kategori dengan progress bar bergradien rose gold.
- **Pelacak Anggaran Bulanan**: Monitoring batas maksimal pengeluaran dengan peringatan 80%+ dan over-budget.

---

## 📋 5. Tabel Riwayat & Portabilitas Data

- **Pencarian & Multi-Filter**: Cari berdasarkan catatan, nominal, kategori, jenis transaksi, atau dompet spesifik.
- **Badge Sumber Dana**: Label jelas dompet asal/tujuan pada setiap baris transaksi.
- **Cadangan Data (Backup & Restore)**: Ekspor seluruh data ke file **JSON** atau **CSV/Excel**, serta impor kembali data JSON kapan saja.

---

## 🛠️ Arsitektur & Struktur Folder

```text
tempat pengeluaran uang/
├── data/
│   ├── wallets.json              # Database persisten akun & dompet
│   ├── goals.json                # Database persisten tujuan finansial (brankas virtual)
│   ├── reminders.json            # Database persisten tagihan rutin & pinjaman
│   ├── transactions.json         # Database persisten transaksi keuangan
│   └── settings.json             # Target anggaran & konfigurasi
├── server/
│   ├── db.js                     # Relational logic, atomic file writes & calculations
│   └── index.js                  # Express REST API (port 5000) & static hosting
├── src/
│   ├── components/
│   │   ├── FinancialGoals.jsx     # Seksi tujuan finansial & progress bar brankas
│   │   ├── GoalModal.jsx          # Modal buat & edit target finansial
│   │   ├── GoalFundModal.jsx      # Modal alokasi dana ("Tambah/Tarik Dana")
│   │   ├── SmartReminders.jsx     # Widget pengingat tagihan & hutang-piutang
│   │   ├── ReminderModal.jsx      # Modal buat & edit tagihan / pinjaman
│   │   ├── PayReminderModal.jsx   # Modal konfirmasi pembayaran tagihan
│   │   ├── WalletCards.jsx        # Seksi saldo per akun/dompet (DANA, ShopeePay, dll)
│   │   ├── WalletModal.jsx        # Modal CRUD akun/dompet baru
│   │   ├── DeleteWalletModal.jsx  # Modal dialog konfirmasi hapus dompet
│   │   ├── Header.jsx             # Top bar, identitas brand, stepper navigasi bulan
│   │   ├── SummaryCards.jsx       # Kartu ringkasan total saldo, cashflow & savings
│   │   ├── BudgetOverview.jsx     # Pelacak target anggaran bulanan
│   │   ├── FinancialCharts.jsx    # Visualisasi grafik tren & kategori
│   │   ├── TransactionModal.jsx   # Form modal transaksi (Pengeluaran, Pemasukan, Transfer)
│   │   ├── TransactionTable.jsx   # Tabel riwayat dengan badge dompet & filter
│   │   ├── DeleteConfirmModal.jsx # Modal konfirmasi hapus transaksi
│   │   ├── ExportImportModal.jsx  # Modal cadangan data JSON & CSV
│   │   └── Toast.jsx              # Notifikasi visual feedback animasi
│   ├── services/
│   │   └── api.js                 # Client API adapter
│   ├── utils/
│   │   └── formatters.js          # Format mata uang IDR & tanggal Indonesia
│   ├── App.jsx                    # State management utama dan layout reaktif
│   ├── index.css                  # Tailwind CSS v4 & custom Rose Gold styling
│   └── main.jsx                   # React entry point
├── package.json
└── vite.config.js
```

---

## ⚡ Cara Menjalankan Aplikasi

Aplikasi backend saat ini sudah berjalan aktif di latar belakang pada port `5000`.

### 1. Mode Development (Hot Reloading Frontend + Backend)
```bash
npm run dev
```
> Buka browser di: **`http://localhost:3000`**

### 2. Mode Produksi / Standalone (1 Perintah)
```bash
npm run build
npm start
```
> Buka browser di: **`http://localhost:5000`**
