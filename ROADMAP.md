# PaperTrace Implementation Roadmap

> Step-by-step plan for building PaperTrace: Next.js scaffold, Neon DB connection, and Tiptap editor — followed by the full feature phases from `PRD.md`.
>
> **Status:** Approved. Ready to execute from Phase 0.

---

## Locked Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Design source conflict (`README.md` "cream/serif" vibe vs `DESIGN.md` Notion tokens) | **DESIGN.md wins** — Inter font, `#f6f5f4` canvas, `#0075de` primary blue |
| 2 | Markdown export package (FR-6.1) | **Official `@tiptap/markdown`** (`editor.getMarkdown()`). The community `tiptap-markdown` package is abandoned by its author; the official package is actively maintained since Tiptap v3.7 |
| 3 | Spec drift (specs written for older versions) | Docs updated in Phase 6 after implementation — no action needed upfront |

## Version Decisions (supersede specs — specs get updated in Phase 6)

| Spec says | We use | Impact on spec blueprints |
|---|---|---|
| Next.js 14 | **Next.js 16** | `params` is now a **Promise** → `const { key } = await params` in pages & route handlers (blueprint D breaks otherwise) |
| Tailwind v3 + config file | **Tailwind v4** | No `tailwind.config.js`; design tokens live in `globals.css` via `@theme` |
| Tiptap v2 APIs | **Tiptap v3** | `CharacterCount` imports from `@tiptap/extensions` (not `@tiptap/extension-character-count`); `immediatelyRender: false` required under SSR; StarterKit bundles lists/underline/link |
| `tiptap-markdown` (community) | **`@tiptap/markdown`** (official) | `editor.getMarkdown()` instead of `editor.storage.markdown.getMarkdown()` |

---

## Phase 0 — Next.js Scaffold (foundation)

1. **Prereq check:** Node.js >= 22 (24 LTS recommended), npm.
2. **Scaffold without clobbering spec docs.** `create-next-app` refuses to run in a directory with conflicting files (root `README.md` collides with its template). Scaffold into a temp folder, then merge:
   ```powershell
   npx create-next-app@latest pt-scaffold --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm
   ```
   Move **all** generated files (including hidden: `.gitignore`, `.git`) from `pt-scaffold/` into the project root, then delete `pt-scaffold/`. Spec docs stay untouched at root.
   - Decline `src/` — `README.md`'s documented structure uses root-level `app/`, `components/`, `db/`.
   - Accept the offered `AGENTS.md` (kept updated per project convention).
3. **Smoke test:** `npm run dev` → default page renders at `localhost:3000` (confirms Tailwind v4 pipeline works).
4. **Restore project README:** merge spec `README.md` content back over the generated boilerplate README.
5. **Install all runtime deps in one pass:**
   ```powershell
   npm install @neondatabase/serverless @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extensions @tiptap/markdown bcryptjs qrcode.react lucide-react
   npm install -D @types/bcryptjs
   ```
6. **Relocate schema:** move `SCHEMA.sql` → `db/schema.sql` (README's structure expects it there).

**Checkpoint:** dev server boots, Tailwind classes render, `git log` shows initial commit.

---

## Phase 1 — Design Tokens (Tailwind v4, CSS-first)

1. **Font:** wire Inter via `next/font/google` in `app/layout.tsx` (DESIGN.md sanctions Inter as the NotionInter substitute).
2. **Tokens:** in `app/globals.css`, replace boilerplate with `@import "tailwindcss";` plus a `@theme { }` block mapping DESIGN.md: colors (`--color-canvas-soft: #f6f5f4`, `--color-primary: #0075de`, ink ramp, hairline, sticker accents), radius scale, spacing scale.
3. **Typography plugin** (for the editor's `prose` classes in blueprint A): `npm install -D @tailwindcss/typography`, register with `@plugin "@tailwindcss/typography";` in `globals.css`.
4. **Base canvas:** set `bg-canvas-soft text-ink` on `<body>` in root layout.

**Checkpoint:** a test page renders warm-canvas background, Inter type, and a `prose` block styled correctly.

---

## Phase 2 — Neon DB Connection

1. **Create Neon project** (console.neon.tech, free tier) → copy the **pooled** connection string.
2. **Env:** create `.env.local` (already gitignored by scaffold):
   ```env
   DATABASE_URL="postgresql://…-pooler…neon.tech/neondb?sslmode=require"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. **Init schema:** paste `db/schema.sql` into the Neon SQL Editor → run → verify `notes` table + 4 indexes + trigger exist.
4. **Client:** create `db/index.ts`:
   ```ts
   import { neon } from "@neondatabase/serverless";
   if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
   export const sql = neon(process.env.DATABASE_URL);
   ```
   (HTTP mode — stateless, edge-safe, no pool management; matches TECH_STACK.md's `import { sql } from "@/db"`.)
5. **Verify end-to-end:** route `app/api/health/db/route.ts` → `await sql\`SELECT version()\`` → expect JSON at `/api/health/db`. Keep it as a permanent health check (useful for deploys).

**Checkpoint:** `/api/health/db` returns the Postgres version; a test `INSERT`/`SELECT` round-trips through the `notes` table.

---

## Phase 3 — Tiptap Editor Core

1. **`components/editor/TiptapEditor.tsx`** — adapt blueprint A to v3:
   - `'use client'` + `immediatelyRender: false` (mandatory under Next SSR).
   - `StarterKit` covers FR-2.1 entirely (H1–H3, bold, italic, strike, code, code block, lists, blockquote, horizontal rule — all bundled in v3).
   - `import { CharacterCount } from "@tiptap/extensions"`.
   - `import { Markdown } from "@tiptap/markdown"` — enables `editor.getMarkdown()` for FR-6.1.
   - `onUpdate` emits `{ html, json, md }` upward.
2. **Toolbar** (`components/editor/Toolbar.tsx`): Lucide-icon buttons calling `editor.chain().focus().toggleBold()` etc., with active-state highlighting.
3. **Status bar:** `editor.storage.characterCount.words()` / `.characters()`; reading time `Math.ceil(words / 200)` (FR-2.2).
4. **Raw/Preview toggle** (FR-2.4): toggle between `<EditorContent>` and a `<pre>` of the raw Markdown/HTML source.
5. **Auto-save hook:** `hooks/useAutoSave.ts` — blueprint B works verbatim.
6. **Scratch verification page:** temporarily mount the editor on `/` (or `/playground`), type, confirm counts update and `onUpdate` payloads log correctly.

**Checkpoint:** editor renders with no hydration errors, all FR-2.1 formatting works, metadata bar live-updates, debounce hook fires 1.5s after typing stops.

---

## Phase 4 — Notes API (CRUD, PIN, TTL, Share)

All route handlers under `app/api/notes/`, using `await params` (Next 16) and blueprint D's flow:

1. `POST /api/notes` — create; 409 if `note_key` taken (FR-1.3).
2. `GET /api/notes/[key]` — fetch; 404/410 handling; **burn-on-read DELETE after fetch** (FR-4.2); if `is_protected`, strip `content_html`/`content_json` from payload (FR-3.3).
3. `PATCH /api/notes/[key]` — auto-save target for Phase 3's hook.
4. `POST /api/notes/[key]/pin` — set PIN: `bcryptjs.hash(pin, 10)` (FR-3.2).
5. `POST /api/notes/[key]/verify` — `bcryptjs.compare`; on success return full content.
6. `PATCH /api/notes/[key]/settings` — TTL mode → compute `expires_at` (FR-4.1).
7. `POST /api/notes/[key]/share` — mint `read_only_token` + `edit_token` (`crypto.randomUUID()`).
8. `GET /api/notes/share/v/[token]` and `…/e/[token]` — token lookups (FR-5.1/5.2).

**Checkpoint:** full cycle via REST client — create → save → PIN-gate → verify → share-token fetch → burn-on-read deletes row.

---

## Phase 5 — Pages & UX Wiring

1. **Home** (`app/page.tsx`): two-card layout (FR-1.1), random-key generator `nk-XXXXXXXX` (FR-1.2), inline errors (FR-1.3).
2. **Editor page** (`app/note/[key]/page.tsx`): server component fetches via API, passes content to client editor; wire auto-save PATCH + "Saved" badge (FR-2.3).
3. **Modals** (`components/modals/`): PIN prompt, Share modal with `QRCodeSVG` from `qrcode.react` (FR-5.3), TTL danger-zone dropdown.
4. **Share pages:** `/share/v/[token]` (editor with `editable: false`), `/share/e/[token]` (full editor, key never exposed).
5. **Export menu** (FR-6.x): blueprint C's Blob utility works verbatim — `.txt` from `getText()`, `.md` from `getMarkdown()`, `.html` from `getHTML()`.

**Checkpoint:** all six PRD user workflows pass manually in the browser.

---

## Phase 6 — Hardening, Cron & Deploy

1. **TTL pruning cron** (FR-4.3): `app/api/cron/prune/route.ts` (`DELETE WHERE expires_at < NOW()`), `vercel.json` cron entry. Note: Vercel Hobby free tier allows **daily** crons only — acceptable since minimum TTL is 1 day.
2. **Dynamic rendering:** `export const dynamic = "force-dynamic"` on data-fetching pages (Next 16 caches aggressively by default).
3. **Polish:** empty/loading/error states, mobile responsiveness pass (NFR-3), 44px touch targets.
4. **Deploy:** push to GitHub → import in Vercel → set env vars → run schema on the production Neon branch. Optional: Neon DB branch per Vercel preview.
5. **Doc updates (spec drift cleanup):** refresh `TECH_STACK.md` blueprints A & D to the shipped v3/16 APIs; update `README.md` version table; keep `AGENTS.md` current.

---

## Execution Order

Phases 0–3 are strictly sequential (each gates the next). Phase 4 API routes can be built in parallel with Phase 5 presentational components once Phase 3 lands.
