# PaperTrace 📝

> A lightweight, account-free, key-based note-taking web application with a paper notebook vibe. Built with Next.js, Tiptap, Neon PostgreSQL, and Tailwind CSS.

---

## 🎨 Theme & Vibe

PaperTrace is designed to evoke a warm, tactile paper journal—like writing on heavy cream-colored fountain pen paper inside a physical notebook. It avoids harsh digital blacks and cold blue-grays in favor of warm cream canvas backgrounds, subtle paper borders, and classical serif typography for document titles.

---

## 🚀 Key Features

- **No Accounts Required:** Notes are accessed strictly via custom or auto-generated **Keys**.
- **Two-Input Home Screen:** Explicit distinction between opening an existing key and creating a new one.
- **Rich Text WYSIWYG Editor:** Powered by **Tiptap** with full support for headings, lists, code blocks, and blockquotes.
- **PIN Protection:** Optional 4-digit PIN lock using server-side `bcrypt` hashing.
- **Self-Destruct & TTL:** Selectable expiration periods (1 day, 7 days, 30 days, or **Burn-on-Read**).
- **Auto-Save with Debouncing:** Automatic saving 1.5 seconds after editing stops.
- **Dual-Token Sharing:** Generate separate **Read-Only** (`/share/v/[token]`) or **Editable** (`/share/e/[token]`) links with optional QR code generation.
- **Word & Reading Metadata:** Real-time character count, word count, and estimated reading time.
- **Raw / Preview Mode:** Instant toggle between rich rendered prose and raw Markdown/HTML.
- **Multi-Format Client-Side Export:** One-click download as `.txt`, `.md`, or `.html` directly in the browser.

---

## 🛠️ Tech Stack & Architecture

| Layer                         | Technology                       | Purpose                                                       |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------- |
| **Framework**                 | Next.js 16 (App Router)          | React 19 framework with serverless API routes                 |
| **Styling**                   | Tailwind CSS v4                  | CSS-first utility framework with `@theme` design tokens       |
| **Editor**                    | Tiptap v3 (ProseMirror)          | Headless WYSIWYG editor framework                             |
| **Database**                  | Neon Serverless PostgreSQL       | Low-latency PostgreSQL DB hosted on serverless infrastructure |
| **Authentication**            | Custom PIN (bcryptjs)            | Hashed numeric PIN protection per note                        |
| **Export & Client Utilities** | Native Blob API / `qrcode.react` | Client-side file generation and QR codes                      |
| **Cron / TTL Pruning**        | Vercel Cron                      | Daily cleanup of expired notes                                |

---

## 🚦 Getting Started Locally

### 1. Prerequisites

- Node.js `22.x` or higher (24 LTS recommended)
- npm, pnpm, or yarn
- A free [Neon PostgreSQL](https://neon.tech) account

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://user:password@ep-cool-sample-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="a-long-random-secret-for-production-cron"
```

### 3. Database Initialization

Run the SQL script inside `db/schema.sql` inside your Neon SQL Console to set up tables and indexes.

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
├── app/
│   ├── layout.tsx                # Root layout with warm cream theme wrappers
│   ├── page.tsx                  # Home screen (Two-Input key access layout)
│   ├── note/
│   │   └── [key]/page.tsx        # Main Tiptap editor interface & toolbar
│   ├── share/
│   │   ├── v/[token]/page.tsx    # Read-only shared view
│   │   └── e/[token]/page.tsx    # Editable shared view
│   └── api/
│       ├── notes/                # Serverless API routes (CRUD, PIN, Share, Burn)
│       └── cron/prune/route.ts   # Daily TTL pruning cron
├── components/
│   ├── editor/                   # Tiptap toolbar, status bar, raw toggle
│   ├── home/                     # Open key form, Create key form
│   └── modals/                   # PIN prompt, Share modal, TTL dropdown
├── db/
│   ├── schema.sql                # Neon PostgreSQL schema definition
│   └── index.ts                  # @neondatabase/serverless client connection
├── DESIGN.md                     # Design specification & system tokens
└── PRD.md                        # Product Requirements Document
```
