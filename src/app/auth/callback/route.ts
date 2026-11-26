import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Nur projektinterne Pfade zulassen – sonst wäre das eine offene Weiterleitung. */
function sichererPfad(wert: string | null): string {
  if (!wert) return '/';
  if (!wert.startsWith('/')) return '/';
  if (wert.startsWith('//')) return '/';
  return wert;
}

/**
 * GET /auth/callback
 *
 * Hier landet der Anmeldelink aus der E-Mail. Supabase hängt entweder einen
 * `code` (PKCE) oder `token_hash` + `type` an.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const weiter = sichererPfad(searchParams.get('weiter'));

  // Supabase meldet Fehler direkt am Rücklauf.
  const fehlerCode = searchParams.get('error_code');
  const fehlerBeschreibung = searchParams.get('error_description') ?? '';

  if (fehlerCode) {
    return NextResponse.redirect(
      new URL(`/anmelden?fehler=${einordnen(fehlerCode, fehlerBeschreibung)}`, origin),
    );
  }

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const typ = searchParams.get('type');

  const supabase = await createClient();

  let fehler: { code?: string; message: string } | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    fehler = error ? { code: error.code, message: error.message } : null;
  } else if (tokenHash && typ) {
    const { error } = await supabase.auth.verifyOtp({
      type: typ as 'magiclink' | 'email' | 'invite' | 'recovery',
      token_hash: tokenHash,
    });
    fehler = error ? { code: error.code, message: error.message } : null;
  } else {
    return NextResponse.redirect(new URL('/anmelden?fehler=ungueltig', origin));
  }

  if (fehler) {
    return NextResponse.redirect(
      new URL(`/anmelden?fehler=${einordnen(fehler.code ?? '', fehler.message)}`, origin),
    );
  }

  // Eingeladene Mitgliedschaften aktivieren. Scheitert das, kommt der Nutzer
  // trotzdem herein – er landet dann auf der Hinweisseite statt im Nirgendwo.
  const { error: aktivierFehler } = await supabase.rpc('activate_my_memberships');
  if (aktivierFehler) {
    console.error('[auth] Mitgliedschaften nicht aktiviert', {
      code: aktivierFehler.code,
    });
  }

  return NextResponse.redirect(new URL(weiter, origin));
}

/** Übersetzt Supabase-Fehler in die Hinweise der Anmeldeseite. */
function einordnen(code: string, beschreibung: string): string {
  const text = `${code} ${beschreibung}`.toLowerCase();
  if (text.includes('expired')) return 'abgelaufen';
  if (text.includes('already') || text.includes('used')) return 'verbraucht';
  return 'ungueltig';
}
