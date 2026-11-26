import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Erneuert die Sitzung bei jeder Anfrage und schreibt die Cookies zurück.
 *
 * Nötig, weil Server-Komponenten keine Cookies setzen dürfen: ohne diesen
 * Durchlauf würde ein abgelaufenes Zugriffstoken nie erneuert und der Nutzer
 * mitten im Arbeiten abgemeldet. Die Sitzung hält 30 Tage und verlängert sich
 * dabei gleitend (siehe supabase/config.toml).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() prüft das Token gegen Supabase. getSession() würde dem Cookie
  // vertrauen, das manipulierbar ist.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
