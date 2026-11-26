import { HeidiZeichen } from '@/components/heidi-zeichen';

/** Zentrierte Karte für öffentliche Seiten und Hinweisseiten ohne Sidebar. */
export function HinweisKarte({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-h-canvas p-4">
      <div className="w-full max-w-md rounded-panel border border-h-border bg-h-surface p-6 shadow-shell sm:p-8">
        <HeidiZeichen className="mb-8" />
        <h1 className="text-paneltitel text-h-text">{titel}</h1>
        <div className="mt-5 flex flex-col gap-5">{children}</div>
      </div>
    </main>
  );
}
