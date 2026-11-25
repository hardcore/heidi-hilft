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

import { NextRequest } from 'next/server';
import { GET } from './route';

// NextRequest, nicht Request: der Handler liest die Suchparameter über nextUrl.
function request(query = '') {
  return new NextRequest(`http://localhost:3000/api/access-log${query}`);
}

describe('GET /api/access-log', () => {
  beforeEach(() => {
    stubs.client = createSupabaseStub({ access_log: { data: [], error: null } });
    stubs.session = session();
  });

  it('liefert das Protokoll des eigenen Betriebs', async () => {
    const response = await GET(request(`?tenantId=${ALPHA}`));
    expect(response.status).toBe(200);
  });

  it('nutzt den aktiven Betrieb, wenn keine Kennung mitkommt', async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
  });

  it('verweigert das Protokoll eines fremden Betriebs mit 403', async () => {
    const response = await GET(request(`?tenantId=${BETA}`));
    expect(response.status).toBe(403);
  });

  it('antwortet ohne Anmeldung mit 401', async () => {
    stubs.session = null;
    const response = await GET(request(`?tenantId=${ALPHA}`));
    expect(response.status).toBe(401);
  });

  it('meldet 400, wenn kein Betrieb ausgewählt ist', async () => {
    stubs.session = session({ activeTenant: null, memberships: [] });
    const response = await GET(request());
    expect(response.status).toBe(400);
  });
});
