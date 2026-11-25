import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALPHA, BETA, createSupabaseStub, session } from '@/test/supabase-mock';

const stubs = vi.hoisted(() => ({
  client: null as ReturnType<typeof import('@/test/supabase-mock')['createSupabaseStub']> | null,
  session: null as unknown,
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: async () => stubs.client }));

vi.mock('@/lib/auth/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/session')>();
  return {
    ...actual,
    getSessionContext: async () => stubs.session,
    // requireSession muss mitgemockt werden: die echte Funktion ruft intern ihr
    // eigenes getSessionContext auf, nicht den hier ersetzten Export.
    requireSession: async () => {
      if (!stubs.session) throw new actual.UnauthorizedError();
      return stubs.session;
    },
  };
});

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost:3000/api/tenants/switch', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/tenants/switch', () => {
  beforeEach(() => {
    stubs.client = createSupabaseStub();
    stubs.session = session();
  });

  it('wechselt in einen Betrieb mit Mitgliedschaft', async () => {
    const response = await POST(request({ tenantId: ALPHA }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tenantId).toBe(ALPHA);
    expect(stubs.client!.calls).toEqual([
      { table: 'profiles', op: 'update', payload: { last_tenant_id: ALPHA } },
    ]);
  });

  it('verweigert den Wechsel in einen fremden Betrieb mit 403', async () => {
    const response = await POST(request({ tenantId: BETA }));

    expect(response.status).toBe(403);
    expect(stubs.client!.calls).toHaveLength(0);
  });

  it('antwortet ohne Anmeldung mit 401', async () => {
    stubs.session = null;
    const response = await POST(request({ tenantId: ALPHA }));
    expect(response.status).toBe(401);
  });

  it('weist eine Kennung ab, die keine UUID ist', async () => {
    const response = await POST(request({ tenantId: 'alpha' }));
    expect(response.status).toBe(400);
  });

  it('lässt einen Plattform-Admin auch ohne Mitgliedschaft wechseln', async () => {
    stubs.session = session({ isPlatformAdmin: true });
    const response = await POST(request({ tenantId: BETA }));
    expect(response.status).toBe(200);
  });
});
