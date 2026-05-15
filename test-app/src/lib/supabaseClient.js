import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_KEY

/** Browser-safe client — use anon public key only (SUPABASE_KEY or VITE_SUPABASE_ANON_KEY). Never service_role. */
export const supabase =
  url && anonKey ? createClient(url, anonKey, { realtime: { params: { eventsPerSecond: 10 } } }) : null

export function supabaseConfigured() {
  return Boolean(url && anonKey)
}

/** Default `cashier_id` for POS RPCs / inventory audit (matches seed `cashier` row). */
export function defaultPosCashierId() {
  const n = Number(import.meta.env.VITE_TX_CASHIER_ID)
  return Number.isInteger(n) && n > 0 ? n : 1
}
