import { vi } from 'vitest';
import type { SessionContext } from '@/lib/supabase/types';

// Gültige UUIDs nach RFC 4122 (Version 4, Variante 8) – Zod prüft Version und Variante.
export const ALPHA = '11111111-1111-4111-8111-111111111111';
export const BETA = '22222222-2222-4222-8222-222222222222';


/** Ergebnis, das ein gemockter Supabase-Aufruf zurückgibt. */
export interface StubResult {
  data?: unknown;
  error?: { code?: string; message?: string; status?: number } | null;
}

/**
 * Minimaler Supabase-Doppelgänger: jede Kettenmethode gibt sich selbst zurück,
 * und am Ende liegt das hinterlegte Ergebnis an. Reicht für Route-Handler-Tests;
 * die Zugriffsregeln selbst werden in supabase/tests/proj1_rls.test.sql geprüft,
 * weil sie nur in einer echten Datenbank aussagekräftig sind.
 */
export function createSupabaseStub(results: Record<string, StubResult> = {}) {
  const calls: Array<{ table: string; op: string; payload?: unknown }> = [];

  function makeChain(table: string) {
    const result = results[table] ?? { data: null, error: null };
    const chain: Record<string, unknown> = {};
    const passthrough = [
      'select', 'eq', 'is', 'order', 'limit', 'in', 'neq', 'gt', 'lt',
    ];

    for (const method of passthrough) {
      chain[method] = vi.fn(() => chain);
    }
    for (const method of ['insert', 'update', 'delete', 'upsert'] as const) {
      chain[method] = vi.fn((payload?: unknown) => {
        calls.push({ table, op: method, payload });
        return chain;
      });
    }
    chain.single = vi.fn(async () => result);
    chain.maybeSingle = vi.fn(async () => result);
    chain.then = (resolve: (value: StubResult) => unknown) => resolve(result);

    return chain;
  }

  return {
    calls,
    from: vi.fn((table: string) => makeChain(table)),
    auth: {
      signInWithOtp: vi.fn(async () => results.__otp ?? { data: {}, error: null }),
      getUser: vi.fn(async () => ({
        data: { user: results.__user?.data ?? null },
        error: null,
      })),
      admin: {
        inviteUserByEmail: vi.fn(
          async () => results.__invite ?? { data: { user: { id: 'invited-id' } }, error: null },
        ),
      },
    },
  };
}

/** Sitzungskontext für Tests. */
export function session(overrides: Partial<SessionContext> = {}): SessionContext {
  const tenant = {
    id: ALPHA,
    name: 'Fahrschule Alpha',
    short_name: 'FA',
    status: 'active' as const,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  };

  return {
    userId: 'user-alpha-admin',
    email: 'admin.alpha@example.test',
    isPlatformAdmin: false,
    memberships: [
      {
        id: 'm1',
        tenant_id: tenant.id,
        profile_id: 'user-alpha-admin',
        role: 'tenant_admin',
        status: 'active',
        invited_at: '2026-11-01T00:00:00Z',
        first_login_at: null,
        tenant,
      },
    ],
    activeTenant: tenant,
    activeRole: 'tenant_admin',
    ...overrides,
  };
}

