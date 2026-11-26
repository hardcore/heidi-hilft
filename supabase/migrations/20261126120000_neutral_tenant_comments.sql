-- Sprachliche Korrektur: Heidi ist branchenunabhaengig.
-- Die Kommentare der bereits angewendeten Migration nannten eine Fahrschule als
-- Beispiel. Fahrschulen sind der Markteinstieg, nicht die Grenze des Produkts.
-- Eigene Migration, weil 20261125120000 schon angewendet ist und nicht erneut laeuft.

comment on table public.tenants is
  'Ein Kunde von AWSMD - ein Betrieb beliebiger Branche. Mandanten-Wurzel.';

comment on column public.tenants.short_name is
  'Kürzel für die Seitenleiste, z. B. MG für Muster GmbH.';
