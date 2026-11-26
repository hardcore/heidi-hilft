---
paths:
  - "src/app/api/**"
  - ".env*"
  - "supabase/**"
  - "next.config.*"
---

# Security Rules

## Secrets Management
- NEVER commit secrets, API keys, or credentials to git
- Use `.env.local` for local development (already in .gitignore)
- Use `NEXT_PUBLIC_` prefix ONLY for values safe to expose in browser
- Document all required env vars in `docs/environment.md` (names and purpose, never values).
  There is no `.env.local.example`; it was removed on 2026-11-26 in favour of that document,
  because Claude Code is denied read and write access to `.env*` and cannot maintain it.

## Input Validation
- Validate ALL user input on the server side with Zod
- Never trust client-side validation alone
- Sanitize data before database insertion

## Authentication
- Always verify authentication before processing API requests
- Use Supabase RLS as a second line of defense
- Implement rate limiting on authentication endpoints

## Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Strict-Transport-Security with includeSubDomains

## Code Review Triggers
- Any changes to RLS policies require explicit user approval
- Any changes to authentication flow require explicit user approval
- Any new environment variables must be documented in `docs/environment.md`
