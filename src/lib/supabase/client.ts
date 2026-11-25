import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase-Client für den Browser. Nur der öffentliche Schlüssel.
 * Der Dienstschlüssel darf hier niemals auftauchen – er umgeht alle
 * Zugriffsregeln und wäre im Browser ein Generalschlüssel für alle Mandanten.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
