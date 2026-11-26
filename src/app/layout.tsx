import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Inter laut docs/design-system.md. Die vollständige Typo- und Farbpalette
// folgt mit PROJ-2; hier nur die Schrift, damit nichts später umgestellt
// werden muss, was ohnehin feststeht.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Heidi',
  description: 'KI-Assistentin für WhatsApp – beantwortet Kundenanfragen rund um die Uhr.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
