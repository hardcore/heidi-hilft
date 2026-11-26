import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/** Seiten, die ohne Anmeldung erreichbar sind. */
const OEFFENTLICH = ['/anmelden', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pfad = request.nextUrl.pathname;

  const istOeffentlich =
    OEFFENTLICH.some((p) => pfad === p || pfad.startsWith(`${p}/`)) ||
    pfad.startsWith('/api/auth/');

  if (!user && !istOeffentlich) {
    // Zielseite merken, damit der Nutzer nach der Anmeldung dort landet,
    // wo er hin wollte.
    const ziel = new URL('/anmelden', request.url);
    if (pfad !== '/') {
      ziel.searchParams.set('weiter', pfad + request.nextUrl.search);
    }
    return NextResponse.redirect(ziel);
  }

  if (user && pfad === '/anmelden') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Alles außer Next.js-Interna und Dateien mit Endung.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
