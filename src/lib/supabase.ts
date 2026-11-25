// Beibehalten für Abwärtskompatibilität mit dem Starter-Kit.
// Neuer Code nutzt direkt:
//   src/lib/supabase/server.ts  – Server-Komponenten und Route Handler
//   src/lib/supabase/client.ts  – Browser
//   src/lib/supabase/admin.ts   – Dienstschlüssel, nur serverseitig
export { createClient as createBrowserSupabaseClient } from './supabase/client';
export type * from './supabase/types';
