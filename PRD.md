# Product Requirements Document (PRD)

## Project Title: PaperTrace (Lightweight Key-Based Note App)

**Version:** 1.0.0  
**Status:** Approved for Implementation

---

## 1. Executive Summary & Objective

PaperTrace is an open-access, zero-account, key-driven note-taking web application. Users enter a custom or auto-generated text key (e.g., `nk-project-ideas`) to open or create a persistent note in a database. The app features a rich WYSIWYG editor (Tiptap), optional PIN lock protection, configurable self-destruct timers (TTL), dual-mode share links (read-only/edit), and client-side multi-format export (`.txt`, `.md`, `.html`), wrapped in a warm paper notebook UI design.

---

## 2. Target Persona & Core User Workflows

### Target Persona

Users who want friction-free, immediate note-taking across devices without undergoing account signup, email verification, or password logins.

### User Workflows

1. **Existing Note Access:** User enters key in the "Open Existing Note" field -> System checks database -> Asks for PIN if protected -> Displays note in Tiptap editor.
2. **New Note Creation:** User enters key in the "Create New Note" field (or clicks "Generate Random") -> System checks availability -> Redirects to editor with fresh canvas.
3. **Editing & Auto-Saving:** User edits content -> Debouncing trigger waits 1.5 seconds after typing stops -> Sends silent `PATCH` payload to backend -> Updates status badge to "Saved".
4. **Security & Self-Destruct Config:** User opens Note Settings -> Sets 4-digit PIN and/or sets TTL expiration (`1d`, `7d`, `30d`, `burn_on_read`).
5. **Sharing:** User opens Share menu -> Copies Read-Only URL or Edit URL -> Displays QR code for mobile scanning.
6. **Exporting:** User clicks Export -> Selects `.txt`, `.md`, or `.html` -> Browser downloads file immediately using native Blob API.

---

## 3. Functional Requirements

### 3.1 Home Screen (Two-Input Layout)

- **FR-1.1:** Must present two visually distinct card-based inputs on a single centered page:
  - Input A: "Open Existing Note" (Searches database for existing key).
  - Input B: "Create New Note" (Checks key availability and initializes new record).
- **FR-1.2:** Input B must include a "Generate Random Key" button producing a collision-resistant 8-character alphanumeric string (e.g., `nk-7x9q2m`).
- **FR-1.3:** Inline error handling:
  - Input A shows error if key is not found: _"Note key not found. Please check your key or create a new note below."_
  - Input B shows error if key already exists: _"This key is taken. Use the Open field above to access it."_

### 3.2 Editor Interface (Tiptap & Features)

- **FR-2.1:** WYSIWYG Editor using Tiptap supporting H1, H2, H3, Bold, Italic, Strikethrough, Code, CodeBlock, BulletList, OrderedList, Blockquote, and HorizontalRule extensions.
- **FR-2.2:** Real-time metadata bar displaying Word Count, Character Count, and Estimated Reading Time (`Math.ceil(words / 200)`).
- **FR-2.3:** Auto-save functionality triggered via debounced user input (1500ms delay).
- **FR-2.4:** View Mode Toggle: Ability to switch between Rich Text Preview and Raw Markdown/HTML source view.

### 3.3 Security & PIN System

- **FR-3.1:** Optional numeric 4-digit PIN toggle inside Note Settings.
- **FR-3.2:** Server-side PIN verification using `bcrypt` (10 rounds). Plaintext PINs must never be stored.
- **FR-3.3:** When opening a protected note, the API must omit `content_html` and `content_json` from the payload until valid PIN verification is provided.

### 3.4 TTL & Self-Destruct Mechanics

- **FR-4.1:** Selectable dropdown in "Danger Zone" offering: `Never`, `1 Day`, `7 Days`, `30 Days`, and `Burn-on-Read`.
- **FR-4.2:** In `Burn-on-Read` mode, the record is immediately deleted from Neon PostgreSQL after the initial full fetch response is served.
- **FR-4.3:** Scheduled pruning query executed via Cron endpoint deletes records where `expires_at < NOW()`.

### 3.5 Sharing & QR Code

- **FR-5.1:** Read-Only Share URL (`/share/v/[read_only_token]`) renders editor in non-editable mode (`editable: false`).
- **FR-5.2:** Edit Share URL (`/share/e/[edit_token]`) opens editor with full write permissions without exposing the original `note_key`.
- **FR-5.3:** QR Code modal rendering the current share link URL using `qrcode.react`.

### 3.6 Export Functionality

- **FR-6.1:** Client-side export capabilities to downloadable files:
  - Plain Text (`.txt`) -> derived from `editor.getText()`
  - Markdown (`.md`) -> derived from `editor.storage.markdown.getMarkdown()`
  - HTML (`.html`) -> derived from `editor.getHTML()`
- **FR-6.2:** Zero backend reliance for export triggers.

---

## 4. Non-Functional Requirements

- **NFR-1 (Performance):** Page Load Time (LCP) under 1.2 seconds on serverless edge.
- **NFR-2 (Cost):** 100% free tier operational compatibility (Next.js on Vercel + Neon PostgreSQL free tier).
- **NFR-3 (Usability):** High-contrast legibility, warm paper aesthetic compliance (`DESIGN.md`), and distraction-free mobile responsiveness.
