import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ForbiddenError, UnauthorizedError } from '@/lib/auth/session';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    details === undefined ? { error: message } : { error: message, details },
    { status },
  );
}

/**
 * Einheitliche Fehlerbehandlung für Route Handler.
 * Unerwartete Fehler werden protokolliert, nach außen aber nur allgemein gemeldet –
 * Fehlermeldungen der Datenbank könnten Struktur verraten.
 */
export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return fail(
      'Die Eingabe ist unvollständig oder ungültig',
      400,
      error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }
  if (error instanceof UnauthorizedError) {
    return fail(error.message, 401);
  }
  if (error instanceof ForbiddenError) {
    return fail(error.message, 403);
  }

  console.error('[api] Unerwarteter Fehler', {
    name: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : undefined,
  });
  return fail('Da ist etwas schiefgelaufen. Bitte versuche es erneut.', 500);
}
