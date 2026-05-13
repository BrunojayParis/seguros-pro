# AGENTS.md

## Commands
- Use npm; `package-lock.json` is the only package-manager lockfile.
- `npm run dev` starts the Next dev server.
- `npm run build` runs the production Next build; use this for type/build validation because there is no separate typecheck script.
- `npm run lint` runs ESLint with Next core-web-vitals and TypeScript rules.
- There is currently no test script or formatter script in `package.json`.

## App Structure
- Next is pinned to `16.2.5`; check `node_modules/next/dist/docs/` before assuming older Next APIs or conventions.
- This is a Next 16 App Router project under `src/app`; the current entrypoints are `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css`.
- Imports can use the `@/*` alias for `src/*` from `tsconfig.json`.
- Tailwind is v4 via `@import "tailwindcss"` in `src/app/globals.css` and `@tailwindcss/postcss` in `postcss.config.mjs`; there is no `tailwind.config.*` file.

## Agent Skills
- Use `frontend-design` for building or restyling web UI; the repo-installed skill lives in `.agents/skills/frontend-design/`.
- Use `supabase-postgres-best-practices` before writing or reviewing SQL, schemas, RLS, migrations, or query performance work; the repo-installed skill lives in `.agents/skills/supabase-postgres-best-practices/`.
- `skills-lock.json` is the source of truth for repo-installed skills; avoid hand-editing vendored skill files unless intentionally updating skills.

## Supabase
- Supabase dependencies are installed (`@supabase/ssr`, `@supabase/supabase-js`), but no app client wiring exists yet.
- `src/types/database.types.ts` is generated Supabase schema output; avoid hand-editing it unless the schema source is unavailable.
- The repo has a linked Supabase project under `supabase/.temp/`, but no migrations or `supabase/config.toml` are present.
- ALWAYS work against the DEV Supabase project (`fpalmlinfotpkpmglhlk`, `seguros-pro`).
- NEVER run queries, migrations, branch operations, or writes directly against the PRODUCTION project (`tjpentaydzmfgvmndnds`, `seguros-pro-prod`).
- If local MCP config points to production, switch it back to DEV before doing any database operation.

## Local Config Gotchas
- Supabase MCP is configured in root `opencode.json` as a project-scoped, read-only remote MCP; run `opencode mcp auth supabase` if OpenCode needs OAuth authorization.
- `.env*` files are gitignored; do not commit local Supabase keys or service-role credentials.
