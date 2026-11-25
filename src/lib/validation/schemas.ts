import { z } from 'zod';

/** Anmeldung per Magic Link. */
export const magicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Bitte gib deine E-Mail-Adresse ein')
    .max(254, 'Diese E-Mail-Adresse ist zu lang')
    .email('Das sieht nicht wie eine E-Mail-Adresse aus')
    .transform((value) => value.toLowerCase()),
});

/** Wechsel des aktiven Betriebs. */
export const switchTenantSchema = z.object({
  tenantId: z.string().uuid('Ungültige Betriebskennung'),
});

/** Neuen Betrieb anlegen (nur AWSMD). */
export const createTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Der Name braucht mindestens 2 Zeichen')
    .max(120, 'Der Name darf höchstens 120 Zeichen haben'),
  shortName: z
    .string()
    .trim()
    .min(1, 'Das Kürzel braucht mindestens 1 Zeichen')
    .max(4, 'Das Kürzel darf höchstens 4 Zeichen haben')
    .transform((value) => value.toUpperCase()),
  adminEmail: z
    .string()
    .trim()
    .email('Das sieht nicht wie eine E-Mail-Adresse aus')
    .transform((value) => value.toLowerCase()),
});

/** Support-Einblick freigeben oder widerrufen. */
export const supportGrantSchema = z.object({
  tenantId: z.string().uuid('Ungültige Betriebskennung'),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type SwitchTenantInput = z.infer<typeof switchTenantSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type SupportGrantInput = z.infer<typeof supportGrantSchema>;
