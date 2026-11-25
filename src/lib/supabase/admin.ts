import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client mit Dienstschlüssel. Umgeht ALLE Zugriffsregeln.
 *
 * Nur für Vorgänge, die es nicht anders geben kann: einen Betrieb anlegen,
 * einen Nutzer einladen. Niemals für das Lesen von Kundendaten – dafür ist
 * der Client aus `server.ts` da, der durch die Zugriffsregeln läuft.
 *
 * Die Prüfung unten ist eine Reißleine: gelangt diese Datei versehentlich in
 * ein Browser-Bündel, scheitert sie sofort und sichtbar, statt still einen
 * Generalschlüssel auszuliefern.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'createAdminClient() darf nur serverseitig verwendet werden. ' +
        'Der Dienstschlüssel gehört nie in den Browser.',
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt. Siehe docs/environment.md.',
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
