import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseStub, session } from '@/test/supabase-mock';

const stubs = vi.hoisted(() => ({
  client: null as ReturnType<typeof import('@/test/supabase-mock')['createSupabaseStub']> | null,
  admin: null as ReturnType<typeof import('@/test/supabase-mock')['createSupabaseStub']> | null,
  session: null as unknown,
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: async () => stubs.client }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => stubs.admin }));
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

import { GET, POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost:3000/api/admin/tenants', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as never;
}

const validBody = {
  name: 'Betrieb Gamma',
  shortName: 'fg',
  adminEmail: 'Buero@Gamma.test',
};

describe('GET /api/admin/tenants', () => {
  beforeEach(() => {
    stubs.client = createSupabaseStub({ tenants: { data: [], error: null } });
    stubs.session = session({ isPlatformAdmin: true });
  });

  it('liefert die Betriebsliste für AWSMD', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('verweigert einem Kunden-Admin den Zugriff mit 403', async () => {
    stubs.session = session({ isPlatformAdmin: false });
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it('antwortet ohne Anmeldung mit 401', async () => {
    stubs.session = null;
    const response = await GET();
    expect(response.status).toBe(401);
  });
});

describe('POST /api/admin/tenants', () => {
  beforeEach(() => {
    stubs.session = session({ isPlatformAdmin: true });
    stubs.client = createSupabaseStub();
    stubs.admin = createSupabaseStub({
      tenants: {
        data: { id: 'new-tenant', name: 'Betrieb Gamma', short_name: 'BG', status: 'active' },
        error: null,
      },
      profiles: { data: null, error: null },
      memberships: { data: null, error: null },
    });
  });

  it('legt Betrieb an, lädt den ersten Admin ein und setzt ihn als tenant_admin', async () => {
    const response = await POST(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.tenant.id).toBe('new-tenant');
    expect(stubs.admin!.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'buero@gamma.test',
      expect.anything(),
    );
    expect(stubs.admin!.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'memberships',
          op: 'insert',
          payload: expect.objectContaining({ role: 'tenant_admin' }),
        }),
      ]),
    );
  });

  it('normalisiert das Kürzel in Großbuchstaben', async () => {
    await POST(request(validBody));
    expect(stubs.admin!.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'tenants',
          payload: expect.objectContaining({ short_name: 'FG' }),
        }),
      ]),
    );
  });

  it('nutzt ein bestehendes Profil statt ein zweites Konto anzulegen', async () => {
    stubs.admin = createSupabaseStub({
      tenants: {
        data: { id: 'new-tenant', name: 'Betrieb Gamma', short_name: 'BG', status: 'active' },
        error: null,
      },
      profiles: { data: { id: 'bestehendes-profil' }, error: null },
      memberships: { data: null, error: null },
    });

    const response = await POST(request(validBody));

    expect(response.status).toBe(201);
    expect(stubs.admin!.auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
    expect(stubs.admin!.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'memberships',
          payload: expect.objectContaining({ profile_id: 'bestehendes-profil' }),
        }),
      ]),
    );
  });

  it('verweigert das Anlegen einem Kunden-Admin mit 403', async () => {
    stubs.session = session({ isPlatformAdmin: false });
    const response = await POST(request(validBody));
    expect(response.status).toBe(403);
  });

  it('weist einen zu kurzen Namen mit 400 ab', async () => {
    const response = await POST(request({ ...validBody, name: 'F' }));
    expect(response.status).toBe(400);
  });

  it('weist eine ungültige Admin-Adresse mit 400 ab', async () => {
    const response = await POST(request({ ...validBody, adminEmail: 'keine-adresse' }));
    expect(response.status).toBe(400);
  });
});
