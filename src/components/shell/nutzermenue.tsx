'use client';

import { useTheme } from 'next-themes';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { abmelden } from '@/components/abmelden-knopf';
import type { MembershipRole } from '@/lib/supabase/types';

const ROLLENTEXT: Record<MembershipRole, string> = {
  tenant_admin: 'Kunden-Admin',
  tenant_member: 'Mitarbeiter',
};

export function Nutzermenue({
  email,
  rolle,
  istPlattformAdmin,
}: {
  email: string;
  rolle: MembershipRole | null;
  istPlattformAdmin: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const rollenText = istPlattformAdmin ? 'AWSMD' : rolle ? ROLLENTEXT[rolle] : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Konto und Darstellung"
        className="flex w-full items-center gap-3 rounded-card border border-h-border p-3 transition-colors hover:bg-h-surface-hover"
      >
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-h-surface-3 text-sm font-medium uppercase text-h-text-soft"
        >
          {email.slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm text-h-text">{email}</span>
          {rollenText && <span className="block text-xs text-h-text-muted">{rollenText}</span>}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-h-text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-[240px] rounded-control">
        <DropdownMenuLabel className="mono-label text-xs">Darstellung</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Hell</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dunkel</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">Wie System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void abmelden()} className="gap-2">
          <LogOut aria-hidden="true" className="size-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
