import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// GANTI dua nilai berikut dari Project Settings > API di dashboard Supabase.
export const SUPABASE_URL = "https://ynaaehivkcxvxyqenxjm.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_1wT4koM6sWKV-Z0AVTi0yQ_6Vux_aUH";

export const isConfigured = !SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
  !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function showConfigWarning(target) {
  if (!isConfigured && target) {
    target.innerHTML = '<div class="empty">Konfigurasi Supabase belum diisi. Buka <b>js/supabase.js</b>, lalu masukkan Project URL dan anon/public key.</div>';
  }
}
export function formatDate(value) {
  if (!value) return "Tanggal belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", {day:"numeric",month:"long",year:"numeric"}).format(new Date(value));
}
