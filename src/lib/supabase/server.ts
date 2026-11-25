import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase-Client für Server-Komponenten und Route Handler.
 *
 * Nutzt den öffentlichen Schlüssel und die Sitzung des angemeldeten Nutzers.
 * Jede Abfrage läuft damit durch die Zeilen-Zugriffsregeln der Datenbank –
 * genau das ist gewollt: die Mandantentrennung soll nicht an unserem Code hängen.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // In Server-Komponenten ist das Setzen von Cookies nicht erlaubt.
            // Die Middleware erneuert die Sitzung, deshalb ist das hier unkritisch.
          }
        },
      },
    },
  );
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Umgebungsvariable ${name} fehlt. Siehe docs/environment.md.`,
    );
  }
  return value;
}
