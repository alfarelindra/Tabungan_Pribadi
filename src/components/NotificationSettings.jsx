import React, { useState, useEffect, useCallback } from "react"
import { Bell, BellOff, ExternalLink, MessageSquare, Send } from "lucide-react"

const NOTIF_PERMISSION_KEY = "astaron_notif_permission"

export function useNotifications(reminders = []) {
  const [permission, setPermission] = useState(Notification?.permission || "default")
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem("astaron_webhook") || "")

  const requestPermission = async () => {
    if (!("Notification" in window)) return "denied"
    const result = await Notification.requestPermission()
    setPermission(result)
    localStorage.setItem(NOTIF_PERMISSION_KEY, result)
    return result
  }

  const sendNotification = useCallback((title, body, tag) => {
    if (permission !== "granted") return
    try {
      const n = new Notification(title, {
        body,
        tag: tag || "astaron-reminder",
        icon: "/favicon.svg",
        badge: "/favicon.svg",
      })
      n.onclick = () => { window.focus(); n.close() }
    } catch {}
  }, [permission])

  // Check for upcoming reminders and fire notifications
  useEffect(() => {
    if (permission !== "granted" || !reminders.length) return
    const today = new Date()
    reminders.forEach(rem => {
      if (rem.isPaid) return
      const due = new Date(rem.dueDate + "T00:00:00")
      const diffDays = Math.ceil((due - today) / (1000*60*60*24))
      if (diffDays === 3) {
        sendNotification(`⚠️ Tagihan H-3: ${rem.name}`, `Jatuh tempo dalam 3 hari (${rem.dueDate}). Nominal: Rp ${Number(rem.amount||0).toLocaleString("id-ID")}`, `rem-h3-${rem.id}`)
      } else if (diffDays === 1) {
        sendNotification(`🚨 Tagihan Besok: ${rem.name}`, `Jatuh tempo BESOK (${rem.dueDate}). Segera bayarkan!`, `rem-h1-${rem.id}`)
      } else if (diffDays <= 0 && diffDays > -3) {
        sendNotification(`❗ Tagihan JATUH TEMPO: ${rem.name}`, `Sudah melewati tanggal jatuh tempo! Segera selesaikan.`, `rem-overdue-${rem.id}`)
      }
    })
  }, [reminders, permission, sendNotification])

  return { permission, requestPermission, sendNotification, webhookUrl, setWebhookUrl }
}

export function NotificationSettingsPanel({ reminders = [] }) {
  const { permission, requestPermission, webhookUrl, setWebhookUrl } = useNotifications(reminders)
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveWebhook = () => {
    localStorage.setItem("astaron_webhook", webhookUrl)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const generateWhatsAppLink = (rem) => {
    if (!rem) return "#"
    const text = encodeURIComponent(`🔔 *Astaron Finance Reminder*\n\nTagihan *${rem.name}* jatuh tempo pada *${rem.dueDate}*\nNominal: *Rp ${Number(rem.amount||0).toLocaleString("id-ID")}*\n\nSegera lakukan pembayaran!`)
    return `https://wa.me/?text=${text}`
  }

  const upcomingReminders = reminders.filter(r => {
    if (r.isPaid) return false
    const due = new Date(r.dueDate + "T00:00:00")
    const diff = Math.ceil((due - new Date()) / (1000*60*60*24))
    return diff >= 0 && diff <= 7
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-[#0B0F19] rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          {permission === "granted" ? <Bell className="w-5 h-5 text-emerald-400" /> : <BellOff className="w-5 h-5 text-slate-500" />}
          <div>
            <div className="text-sm font-semibold text-white">Notifikasi Browser</div>
            <div className={"text-xs " + (permission === "granted" ? "text-emerald-400" : permission === "denied" ? "text-rose-400" : "text-slate-500")}>
              {permission === "granted" ? "Aktif – Pengingat H-3 & H-1 diaktifkan" : permission === "denied" ? "Ditolak – Aktifkan di pengaturan browser" : "Belum diizinkan"}
            </div>
          </div>
        </div>
        {permission !== "granted" && permission !== "denied" && (
          <button onClick={requestPermission}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer">
            Izinkan
          </button>
        )}
      </div>
      {upcomingReminders.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> Kirim Pengingat ke WhatsApp
          </div>
          {upcomingReminders.map(rem => {
            const due = new Date(rem.dueDate + "T00:00:00")
            const diff = Math.ceil((due - new Date()) / (1000*60*60*24))
            return (
              <a key={rem.id} href={generateWhatsAppLink(rem)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2.5 hover:border-emerald-500/30 transition-all">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{rem.name}</div>
                  <div className="text-[10px] text-slate-500">H-{diff} • {rem.dueDate}</div>
                </div>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            )
          })}
        </div>
      )}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Webhook / Telegram Bot URL (Opsional)</div>
        <div className="flex gap-2">
          <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://api.telegram.org/bot.../sendMessage"
            className="flex-1 bg-[#0B0F19] border border-slate-700 focus:border-[#E0A96D]/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors" />
          <button onClick={handleSaveWebhook}
            className={"px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (isSaved ? "bg-emerald-600 text-white" : "bg-[#141B2B] border border-slate-700 text-slate-300 hover:border-[#E0A96D]/30")}>
            {isSaved ? "Tersimpan!" : "Simpan"}
          </button>
        </div>
        <p className="text-[10px] text-slate-600">Tambahkan URL webhook Telegram/Discord untuk menerima notifikasi otomatis di chat Anda.</p>
      </div>
    </div>
  )
}
