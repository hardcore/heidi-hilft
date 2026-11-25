import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseStub } from '@/test/supabase-mock';

const stubs = vi.hoisted(() => ({ client: null as ReturnType<typeof import('@/test/supabase-mock')['createSupabaseStub']> | null }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => stubs.client,
}));

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost:3000/api/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/auth/magic-link', () => {
  beforeEach(() => {
    stubs.client = createSupabaseStub();
  });

  it('verschickt einen Link für eine gültige Adresse', async () => {
    const response = await POST(request({ email: 'Buero@Fahrschule.test' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(stubs.client!.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'buero@fahrschule.test',
        options: expect.objectContaining({ shouldCreateUser: false }),
      }),
    );
  });

  it('weist eine ungültige Adresse mit 400 ab', async () => {
    const response = await POST(request({ email: 'keine-adresse' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details?.[0]?.field).toBe('email');
    expect(stubs.client!.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('weist eine leere Anfrage mit 400 ab', async () => {
    const response = await POST(request({}));
    expect(response.status).toBe(400);
  });

  it('antwortet für unbekannte Adressen genauso wie für bekannte', async () => {
    stubs.client = createSupabaseStub({
      __otp: { data: null, error: { code: 'otp_disabled', status: 422 } },
    });

    const response = await POST(request({ email: 'fremd@example.test' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(JSON.stringify(body)).not.toContain('unbekannt');
  });

  it('gibt die Versandbremse als 429 weiter', async () => {
    stubs.client = createSupabaseStub({
      __otp: { data: null, error: { code: 'over_email_send_rate_limit', status: 429 } },
    });

    const response = await POST(request({ email: 'buero@fahrschule.test' }));
    expect(response.status).toBe(429);
  });
});
