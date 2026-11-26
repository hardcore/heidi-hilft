import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { magicLinkSchema } from '@/lib/validation/schemas';
import { fail, handleError, ok } from '@/lib/api/respond';

/** Zieladresse für den Rücklauf. Bewusst aus der Konfiguration, nicht aus dem
 *  Host-Header der Anfrage – sonst ließe sich die Weiterleitung umlenken. */
function callbackUrl(weiter?: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = new URL('/auth/callback', base);
  if (weiter) url.searchParams.set('weiter', weiter);
  return url.toString();
}

/**
 * POST /api/auth/magic-link
 *
 * Verschickt einen Anmeldelink. Antwortet für unbekannte und bekannte Adressen
 * identisch – sonst wäre diese Route ein Werkzeug, um die Kundenliste von AWSMD
 * abzufragen. Neue Zugänge entstehen hier nicht: `shouldCreateUser: false`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, weiter } = magicLinkSchema.parse(body);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: callbackUrl(weiter),
      },
    });

    // Versandbremse von Supabase durchreichen (AC: mehr als drei Links pro Minute).
    if (error?.status === 429) {
      return fail(
        'Du hast gerade mehrere Links angefordert. Bitte versuche es in einer Minute erneut.',
        429,
      );
    }

    // Jeder andere Fehler – allen voran "Adresse unbekannt" – wird NICHT
    // nach außen gegeben. Nur protokolliert, ohne die Adresse.
    if (error) {
      console.warn('[auth] Magic Link nicht verschickt', { code: error.code });
    }

    return ok({
      ok: true,
      message:
        'Wenn die Adresse bei uns hinterlegt ist, ist der Anmeldelink unterwegs. Schau auch im Spam-Ordner.',
    });
  } catch (error) {
    return handleError(error);
  }
}
