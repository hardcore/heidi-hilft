import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/abmelden
 *
 * Beendet die Sitzung. Als POST, damit kein Vorschau-Abruf eines Links
 * den Nutzer versehentlich abmeldet.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
