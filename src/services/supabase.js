import { createClient } from '@supabase/supabase-js'

const defaultUrl = 'https://uvdxsxajeslfmfgtkknv.supabase.co'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl

const getActiveAnonKey = () => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('ASTARON_SUPABASE_ANON_KEY') || ''
    if (localKey && !localKey.includes('placeholder')) {
      return localKey
    }
  }
  return envKey
}

const supabaseAnonKey = getActiveAnonKey()

// Deteksi apakah kredensial anon key sudah diisi atau masih default placeholder
export const isSupabaseConfigured = () => {
  const key = getActiveAnonKey()
  return (
    Boolean(key) &&
    key !== 'sb_publishable_or_anon_key_placeholder' &&
    key !== 'your_supabase_anon_public_key_here' &&
    !key.includes('placeholder')
  )
}

export const saveSupabaseAnonKey = (key) => {
  if (typeof window !== 'undefined' && key) {
    localStorage.setItem('ASTARON_SUPABASE_ANON_KEY', key.trim())
    window.location.reload()
  }
}

export const clearSupabaseAnonKey = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ASTARON_SUPABASE_ANON_KEY')
    window.location.reload()
  }
}

// Inisialisasi Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy_anon_key_placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// === AUTH HELPER FUNCTIONS ===

/**
 * Sign In dengan Email & Password
 */
export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Anon Key belum diatur di file .env')
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

/**
 * Sign Up akun baru dengan Email & Password
 */
export async function signUpWithEmail(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Anon Key belum diatur di file .env')
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) throw error
  return data
}

/**
 * Sign Out (Logout)
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Ambil sesi pengguna saat ini
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Listener perubahan status autentikasi
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
