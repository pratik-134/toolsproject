# Cleartrix: Master Project Architecture, Invariants & AI Developer Guide

> **Product:** Cleartrix (`https://cleartrix.com`)  
> **Umbrella Platform:** Privacy-first, in-browser suite of 168+ tools across 11 categories  
> **Flagship Product:** Cleartrix Resume Builder (`/editor`, `/dashboard`) with 20 Vector PDF & Word DOCX templates  
> **Primary Stack:** Next.js 15.5 (App Router, React 18, TypeScript 5.7, Tailwind CSS 3.4), Zustand 4.5, Zod 3.23, Radix UI primitives, Lucide Icons  
> **AI / Media Boost:** In-browser WebAssembly (Pyodide, Web Workers, Canvas, Web Audio, Web Crypto) + Optional Server Microservice (Python FastAPI for heavyweight Phase 4 models)  
> **Brand & Storage Configuration:** `lib/brand.ts` (`BRAND` object), `ct_` localStorage prefix with non-destructive fallback migration  
> **Purpose of this File:** Single source of truth for all architectural invariants, design system guidelines, tool development workflows, resolved gotchas, and verification commands. Every developer and AI assistant working on this codebase must follow the rules in this document without deviation.

---

## 1. Core Mission & Non-Negotiable Invariants

Cleartrix is one unified, lightning-fast web platform hosting 168+ everyday tools for PDFs, documents, images, developer utilities, calculators, codes, and media. The defining differentiator is **absolute privacy: user files and data are processed directly inside the client browser and never uploaded to any remote server.**

### The 6 Non-Negotiable Invariants (Never Break These):

1. **100% In-Browser Privacy by Default (Zero Server Uploads):**
   - For all client tools (`runtime: 'client'` or `'client-worker'`), user files and text must **never** leave device RAM.
   - Strictly forbidden in client tools: `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSockets carrying user payload, or form POSTs.
   - Enforce Content-Security-Policy: `connect-src 'self'`.
   - Zero telemetry tracking, zero third-party analytics pixels, zero external API logging of user content.
   - Validated automatically on every commit via `npm run test:privacy`.

2. **Zero Paywalls & Zero Forced Registrations:**
   - Free means 100% free forever: zero watermarks on exported PDFs or images, zero paywalled downloads, zero trial expirations, and zero mandatory account creation for client tools.
   - Accounts are strictly optional and reserved for future Phase 5 cloud features.

3. **Multi-Format Export Parity & Resume Builder Continuity:**
   - The flagship Resume Builder (`/editor`) and its 20 professional styles maintain exact pixel-level alignment across:
     - **Web DOM** (Live interactive preview)
     - **Vector PDF** (`@react-pdf/renderer` rendering vector text, selectable fonts, ATS compliance)
     - **Native Word DOCX** (`docx` library generating standard OOXML packages)
   - Any enhancement to the platform must keep the resume builder and its tests (`npm run test:pdf`, `npm run test:docx`, `npm run test:resumes`) 100% green.

4. **Lazy-Load Heavy Libraries:**
   - Heavy dependencies (`@react-pdf/renderer`, `docx`, `pdfjs-dist`, `pdf-lib`, `ffmpeg.wasm`, `tesseract.js`, `konva`, `xlsx`) must **NEVER** be imported into global layouts or unrelated pages.
   - Use dynamic imports (`next/dynamic` or `import()`) only when the specific tool loads or runs.

5. **Registry-Driven Dynamic Architecture:**
   - All tool pages (`/tools/[category]/[slug]`), category hubs (`/tools/[category]`), tools directory (`/tools`), navigation menus, search palettes, and `sitemap.ts` are generated dynamically from `lib/registry/tools.ts` and `lib/registry/categories.ts`.
   - Never hand-code or hard-code static tool routes.

6. **Mandatory Statutory Disclaimers:**
   - Any tool performing financial or taxation calculations (e.g. mortgage, sales tax, inflation, salary paycheck, loan) **must** display the standard statutory financial disclaimer.
   - Any tool calculating health or body metrics (e.g. BMI, BMR/TDEE, water intake, calories) **must** display the standard medical disclaimer.

---

## 2. Codebase Directory Structure

```
cleartrix/
├── app/                                    # Next.js 15 App Router
│   ├── layout.tsx                          # Root layout with Brand metadata, ThemeProvider, Toast, Header & Footer
│   ├── page.tsx                            # Cleartrix homepage (hero, trust pill, tools showcase, templates)
│   ├── brand/page.tsx                      # Brand guidelines, assets & palette
│   ├── dashboard/page.tsx                  # Multi-resume manager with local drafts
│   ├── editor/page.tsx                     # Flagship ATS Resume Builder editor workspace
│   ├── blog/                               # Career guides and platform documentation
│   ├── privacy/page.tsx                    # Privacy Policy & 100% client-side execution guarantees
│   ├── terms/page.tsx                      # Terms of Service
│   ├── sitemap.ts                          # Automated dynamic sitemap for all 168+ tools and hubs
│   ├── robots.ts                           # Search engine crawling rules
│   └── tools/                              # Dynamic Tools Engine
│       ├── page.tsx                        # Complete tools directory hub (live search + category filters)
│       ├── [category]/page.tsx             # Category SEO hub listing all tools in that category
│       └── [category]/[slug]/page.tsx      # Tool workspace (renders dynamic ToolView)
├── components/
│   ├── Navbar.tsx                          # Header navbar with Mega Menu trigger, search shortcut & mobile drawer
│   ├── NavbarMegaMenu.tsx                  # Two-pane desktop mega menu (all 11 categories + search + tools grid)
│   ├── Footer.tsx                          # Universal footer with category sitemap & legal links
│   ├── BrandLogo.tsx                       # Brand logo SVG component (umbrella brand & resume builder)
│   ├── ThemeToggle.tsx                     # System/Dark/Light theme switch
│   ├── tool-shell/                         # Reusable standardized tool UI components
│   │   ├── ToolLayout.tsx                  # Tool container (H1, intro, privacy badge, FAQs, related tools)
│   │   ├── UploadBox.tsx                   # Drag-and-drop file upload with 5MB in-memory guard
│   │   ├── ProgressBar.tsx                 # Processing progress bar with cancel action
│   │   ├── ResultPanel.tsx                 # Output action bar (Copy, Download, Reset)
│   │   └── ErrorState.tsx                  # User-friendly error boundary & recovery card
│   └── tools/
│       ├── ToolView.tsx                    # Dynamic client-side tool loader & RSC boundary
│       ├── CommandPalette.tsx              # Global Ctrl+K / Cmd+K instant tool search dialog
│       └── phase1/                         # Shipped modular tool packages (<slug>/)
│           └── <slug>/
│               ├── index.tsx               # Interactive React UI component
│               ├── logic.ts                # Pure TypeScript domain logic (no React, zero DOM)
│               └── logic.test.ts           # Pure unit test assertions
├── lib/
│   ├── brand.ts                            # Canonical brand configuration (name, domain, storage prefix)
│   ├── tool-icons.ts                       # Dynamic icon resolver and category fallback icon mappings
│   ├── empty-module.js                     # Webpack stub aliasing optional Node modules (canvas, encoding)
│   ├── registry/                           # Tool catalog source of truth (pure serializable data)
│   │   ├── types.ts                        # ToolDefinition, CategoryId, CategoryDefinition
│   │   ├── categories.ts                   # 11 category definitions with metadata and IDs
│   │   └── tools.ts                        # Central registry containing all 168+ tool definitions
│   ├── store/                              # State management
│   │   ├── migrate-brand.ts                # Non-destructive localStorage key migration to ct_ prefix
│   │   ├── storage-utils.ts                # Safe localStorage wrappers with quota guards
│   │   ├── use-resume-store.ts             # Active resume document state, history, undo/redo
│   │   └── use-resume-index-store.ts       # Multi-resume index CRUD
│   ├── pdf/                                # 20 vector PDF templates (@react-pdf/renderer)
│   ├── docx/                               # 20 native Word templates (docx OOXML package generator)
│   └── import/                             # In-browser PDF & Word resume parser
├── scripts/                                # Verification & Quality Assurance Suite
│   ├── test-tools.ts                       # Unit test runner executing all tool logic.test.ts suites
│   ├── test-registry.ts                    # Schema validator (unique slugs, categories, SEO, FAQs)
│   ├── test-privacy.ts                     # AST/regex scanner ensuring zero network leaks in client tools
│   ├── test-docx-templates.ts              # Validates 20 Word template packages
│   ├── test-pdf-templates.tsx              # Validates 20 PDF templates
│   ├── test-multi-resume-store.ts          # Validates multi-resume storage & brand migration
│   └── test-import-parser.ts               # Validates client-side resume import
├── prisma/schema.prisma                    # PostgreSQL database schema (for future Phase 5 accounts)
└── PROJECT.md                              # This master documentation and architectural guide
```

---

## 3. The 4-File Modular Tool Pattern

Every tool in Cleartrix must be built using this strict, modular 4-file pattern. Never combine domain logic with React components:

### 1. `components/tools/phase1/<slug>/logic.ts`
- **Rule:** Contains **only pure TypeScript functions and interfaces**.
- **Forbidden:** Zero React hooks, zero JSX, zero DOM manipulation, zero `window` or `document` calls.
- **Purpose:** All mathematical, parsing, encoding, conversion, or formatting algorithms live here so they can be unit-tested in isolation in Node.js or Web Workers.
- **Example:**
  ```ts
  export interface ToolInput {
    value: string;
    options?: { format: string };
  }
  export interface ToolOutput {
    result: string;
    metrics?: Record<string, number>;
  }
  export function processToolLogic(input: ToolInput): ToolOutput {
    if (!input.value) throw new Error("Input cannot be empty");
    return { result: input.value.trim() };
  }
  ```

### 2. `components/tools/phase1/<slug>/logic.test.ts`
- **Rule:** Exports `runTests(): boolean | Promise<boolean>`.
- **Purpose:** Executes deterministic test vectors and edge cases (empty strings, zero, boundary numbers, corrupted inputs). Throws an informative `Error` if any assertion fails.
- **Example:**
  ```ts
  import { processToolLogic } from "./logic";

  export function runTests(): boolean {
    const res = processToolLogic({ value: "  hello world  " });
    if (res.result !== "hello world") {
      throw new Error(`Expected 'hello world', got '${res.result}'`);
    }
    return true;
  }
  ```

### 3. `components/tools/phase1/<slug>/index.tsx`
- **Rule:** Starts with `"use client";`.
- **Features:**
  - Fully responsive on mobile, tablet, and desktop.
  - High-contrast Dark/Light mode support using Tailwind tokens.
  - Preset/Sample buttons for instant user trial.
  - One-click **Copy to Clipboard** with visual checkmark feedback.
  - One-click **Download** button where applicable.
  - Statutory disclaimer box if the tool calculates financial, medical, or legal data.

### 4. Registration (The 3 Connection Points)
To connect the new tool to the application:
1. **`lib/registry/tools.ts`**: Add tool metadata object:
   ```ts
   {
     slug: "my-tool-slug",
     name: "My Tool Name",
     category: "developer",
     phase: 1,
     status: "live",
     runtime: "client",
     seo: {
       title: "My Tool Name — Free Online Privacy Tool",
       description: "Fast, in-browser privacy tool. No uploads, no account needed.",
       h1: "Free Online My Tool",
       intro: "Easily perform operations directly in your browser with zero data retention.",
       faq: [
         { q: "Is my data uploaded to a server?", a: "No. All processing happens 100% locally in your browser." },
         { q: "Is this tool free?", a: "Yes, completely free with no limits or watermarks." },
         { q: "Does it work offline?", a: "Yes, once loaded, it executes offline via client-side JavaScript." }
       ]
     },
     related: ["json-formatter", "base64-converter"],
   }
   ```
2. **`components/tools/ToolView.tsx`**: Add dynamic import into `TOOL_COMPONENTS`:
   ```ts
   "my-tool-slug": dynamic(() => import("@/components/tools/phase1/my-tool-slug"), {
     ssr: false,
     loading: () => <ToolLoadingState name="My Tool Name" />,
   }),
   ```
3. **`scripts/test-tools.ts`**: Import and call the test:
   ```ts
   import { runTests as testMyTool } from "@/components/tools/phase1/my-tool-slug/logic.test";
   // Inside runAllTests():
   testMyTool();
   ```

---

## 4. UI / UX & Design System Guidelines

### Colors & Dark Mode Tokens
- **Standard Tailwind Grays Only:** Always use standard Tailwind slate colors:
  - Backgrounds: `bg-white dark:bg-slate-900`
  - Cards & Panels: `bg-slate-50/80 dark:bg-slate-800/90`
  - Borders: `border-slate-200 dark:border-slate-700/80`
  - Body Text: `text-slate-700 dark:text-slate-200`
  - Headings: `text-slate-900 dark:text-white`
  - Secondary/Muted: `text-slate-500 dark:text-slate-400`
- **STRICT PROHIBITION:** Never invent custom color classes like `slate-850` or `slate-750` that do not exist in Tailwind defaults, as they silently fail to render in production.

### Navigation & Header Mega Menu
- **Desktop Navigation:**
  - "Tools" nav item triggers the two-pane **Mega Menu** (`components/NavbarMegaMenu.tsx`) on hover or click.
  - Hovering adjacent links (*Blog, Templates, Features, My Resumes, FAQ*) automatically closes the mega menu.
  - Click-outside and Escape key handlers dismiss the menu.
  - `usePathname()` route listener closes all open menus upon navigation.
- **Mega Menu Layout (`components/NavbarMegaMenu.tsx`):**
  - **Left Pane:** Lists all 11 categories with custom icons, active state badges, and live tool counts.
  - **Right Pane:** Categorized tools grid with individual icons, titles, descriptions, and direct deep-links.
  - **Live In-Menu Search:** Real-time filter across all 168+ tools by name, slug, description, and category.
  - **Footer:** In-browser WebAssembly privacy guarantee + direct link to `/tools`.
- **Mobile Responsive Navigation (< 1024px):**
  - Mobile hamburger drawer includes an expandable **"Tools & Utilities" accordion**.
  - Includes mobile search input, horizontal-scrolling category pills, and direct tool links.

### Brand Identity & Storage Migration
- Canonical brand settings are in `lib/brand.ts` (`BRAND.name = "Cleartrix"`, `BRAND.domain = "https://cleartrix.com"`, `storagePrefix = "ct_"`).
- All `localStorage` keys must use the `ct_` prefix.
- `lib/store/migrate-brand.ts` transparently copies legacy keys upon boot without deleting them to protect existing user resume drafts.

---

## 5. Solved Engineering Lessons & Gotchas

Any developer or AI modifying this codebase must adhere to these established solutions:

1. **BigInt Literals Syntax:**
   - Never use BigInt literal notation (e.g. `0n`, `32n`, `126n`) because compiler targets lower than ES2020 fail.
   - **Always use:** `BigInt(0)`, `BigInt(32)`, `BigInt(126)`.

2. **Strict Indexed Access (`noUncheckedIndexedAccess`):**
   - In strict TypeScript, array or string indexing returns `T | undefined`.
   - **Always use:** `str.charAt(0)` for strings, or `arr[0] ?? fallback` for arrays.

3. **Strict Block Function Declarations:**
   - In strict mode, declaring `function helper() {}` inside `if`, `try`, or `switch` blocks triggers errors.
   - **Always use arrow functions:** `const helper = () => {};`.

4. **Webpack 5 Server Prerender Stub (`empty-module.js`):**
   - Certain optional Node dependencies (e.g. `canvas`, `encoding`) fail during static page prerendering (`next build`).
   - We alias them in `next.config.mjs` to `lib/empty-module.js` (`module.exports = {};`).

5. **RSC Serialization Boundary:**
   - Keep `lib/registry/tools.ts` strictly serializable (no React functions or JSX elements).
   - All dynamic component loading lives in `components/tools/ToolView.tsx`.

6. **PowerShell Script Execution on Windows:**
   - Windows PowerShell restricts execution of `.ps1` scripts by default.
   - When running build or test scripts in PowerShell, always execute via:
     `cmd.exe /c "npm run ..."` or `node node_modules/...`

7. **Git Policy:**
   - Unless explicitly instructed by the user, keep all edits in the local working tree and do not run git commands (`git add`, `git commit`, `git push`, `git checkout`).

---

## 6. The 11 Platform Categories & 168+ Shipped Tools

The platform contains 168 tools completely implemented and typed across 11 official categories:

1. **Document & PDF (`document-pdf` — 28 tools):**  
   `pdf-merger`, `pdf-splitter`, `pdf-compressor`, `pdf-page-rotator`, `pdf-page-organizer`, `pdf-bates-stamper`, `pdf-flattener`, `pdf-annotator`, `pdf-redaction-tool`, `pdf-form-builder`, `pdf-form-extractor`, `pdf-digital-signer`, `pdf-encryptor`, `pdf-decryptor`, `docx-to-pdf`, `pdf-to-docx`, `excel-to-pdf`, `powerpoint-to-pdf`, `markdown-to-pdf`, `html-to-pdf`, `direct-docx-editor`, `direct-txt-editor`, `direct-markdown-editor`, `direct-html-editor`, `direct-rtf-creator`, `markdown-note-maker`, `ats-resume-checker`, `resume-import-viewer`.

2. **Developer, Data & Code (`developer` — 18 tools):**  
   `json-formatter`, `base64-converter`, `csv-json-converter`, `hash-generator`, `url-encoder`, `html-beautifier`, `text-diff`, `regex-tester`, `html-entity-encoder`, `json-xml-converter`, `unicode-normalizer`, `sql-formatter`, `hmac-generator`, `json-yaml-converter`, `json-schema-validator`, `code-minifier`, `sql-dump-to-csv`, `excel-to-json-csv`.

3. **Everyday Utilities (`utilities` — 11 tools):**  
   `word-counter`, `password-generator`, `case-converter`, `lorem-generator`, `duplicate-line-remover`, `unit-converter`, `epoch-converter`, `checksum-verifier`, `chmod-calculator`, `archive-extractor`, `archive-packer`.

4. **Calculators (`calculators` — 34 tools):**  
   `mortgage-calculator`, `compound-interest-calculator`, `percentage-calculator`, `bmi-calculator`, `date-calculator`, `age-calculator`, `discount-calculator`, `base-converter`, `sales-tax-calculator`, `freelance-rate-calculator`, `calorie-calculator`, `water-intake-calculator`, `auto-loan-calculator`, `scientific-calculator`, `aspect-ratio-calculator`, `bmr-tdee-calculator`, `inflation-calculator`, `ip-subnet-calculator`, `statistics-calculator`, `fraction-simplifier`, `geometry-calculator`, `time-card-calculator`, `world-clock-converter`, `bandwidth-calculator`, `sip-calculator`, `retirement-401k-calculator`, `debt-payoff-calculator`, `roi-calculator`, `profit-margin-calculator`, `break-even-calculator`, `payroll-paycheck-calculator`, `body-fat-calculator`, `target-heart-rate-calculator`, `pregnancy-due-date-calculator`.

5. **Image Tools (`image` — 11 tools):**  
   `image-converter`, `aspect-ratio-cropper`, `canvas-resizer`, `batch-image-compressor`, `exif-stripper`, `image-base64-converter`, `svg-minifier`, `favicon-generator`, `image-rotator-flipper`, `photo-filter-studio`, `image-watermarker`.

6. **Codes & Barcodes (`codes` — 4 tools):**  
   `qr-generator`, `barcode-generator`, `barcode-scanner`, `qr-scanner`.

7. **Security & Privacy (`security` — 4 tools):**  
   `file-encryptor`, `file-decryptor`, `steganography-tool`, `metadata-stripper`.

8. **Builders (`builders` — 1 tool):**  
   `resume-builder` (Flagship ATS builder with 20 templates and 3-way DOM/PDF/Word export).

9. **Video & Screen Capture (`video` — planned Phase 3):**  
   Webcam & screen recording, video transcoder, video cutter/merger via `ffmpeg.wasm`.

10. **Audio & Voice (`audio` — planned Phase 3):**  
    Voice recorder, audio format converter, waveform cutter, volume normalizer.

11. **URL & Cloud (`url-cloud` — planned Phase 5):**  
    Burn-after-read secret sharer, pastebin, link protector.

---

## 7. Quality Assurance & Verification Commands

Before concluding any feature, tool addition, or refactoring task, execute the verification suite:

```bash
# Typecheck
node node_modules/typescript/bin/tsc --noEmit

# Tool Logic Unit Tests
npx tsx scripts/test-tools.ts

# Registry & Schema Integrity Check
npx tsx scripts/test-registry.ts

# Privacy & Zero-Leak Network Scanner
npx tsx scripts/test-privacy.ts

# Resume Templates Verification
npx tsx scripts/test-pdf-templates.tsx
npx tsx scripts/test-docx-templates.ts
npx tsx scripts/test-multi-resume-store.ts
npx tsx scripts/test-import-parser.ts

# Full Master Verification Suite
npm run check

# Production Build & Static Route Prerender
npm run build
```

---

## 8. AI Assistant Starter Prompt

When starting a new session on this codebase, provide this prompt:

> You are working on **Cleartrix**, a privacy-first web platform with 168+ in-browser tools built on Next.js 15 App Router, TypeScript, and Tailwind CSS.
> Read `PROJECT.md` completely before taking action.
> Follow all non-negotiable invariants:
> 1. Zero server file uploads for client tools (100% in-browser processing).
> 2. Zero paywalls, zero watermarks, zero forced registrations.
> 3. Strict 4-file pattern for tools (`logic.ts`, `logic.test.ts`, `index.tsx`, plus registrations in `tools.ts`, `ToolView.tsx`, `test-tools.ts`).
> 4. Use standard Tailwind color tokens (never use non-standard tokens like `slate-850`).
> 5. Keep all existing features, the Header Mega Menu, and the Resume Builder green.
> Today's task: **[Describe your task here]**.

---

## 9. Future Feature Roadmap & Innovation Plan

The following strategic initiatives and planned enhancements are curated for upcoming development iterations. When implementing any of these features, adhere strictly to Cleartrix invariants: **100% client-side privacy, zero server uploads, zero paywalls, zero watermarks**.

### Category 1: Navigation, Personalization & UX
1. **User Favorites & Quick Access Bar:**
   - Allow users to "star" frequently used tools (e.g. Resume Builder, Invoice Generator, Image Compressor).
   - Persist favorites in `localStorage` under `ct_favorites`.
   - Render a sleek horizontal quick-access ribbon directly below the hero header or inside the Mega Menu.
2. **"Recently Used" History Drawer:**
   - Track the last 5 tools accessed on the client device.
   - Quick one-click re-entry with zero tracking or telemetry.
3. **Interactive Command Palette HUD (Cmd+K / Ctrl+K):**
   - Quick tool launcher with category badges, fuzzy search, and keyboard navigation.
   - Direct shortcut actions (e.g., "Create Invoice", "Convert PDF to JPG", "ATS Resume Check").

### Category 2: Tool Workflows & Smart Automation
1. **One-Click Tool Chaining (Pipelines):**
   - Seamlessly pipe output from one tool into another without manual re-uploading.
   - *Example flow:* PDF Merge &rarr; PDF Compress &rarr; File Encrypt.
   - *Example flow:* SVG to PNG &rarr; Image Resizer &rarr; WebP Converter.
2. **Batch Drag-and-Drop Processing:**
   - Multi-file dropzones for audio, image, and document tools.
   - Client-side parallel Web Worker processing with a single "Download All as ZIP" via `jszip`.
3. **Shareable Tool URL State & Presets:**
   - Encode tool input configurations into URL hash fragments (e.g. `#data=...` or query params).
   - Allows instant bookmarking and sharing of tool presets without server databases.

### Category 3: High-Traffic In-Browser Tools
1. **Screen & Window Recorder (`screen-recorder`):**
   - In-browser screen capture via native `navigator.mediaDevices.getDisplayMedia`.
   - Options for microphone voiceover, webcam picture-in-picture, and system audio.
   - Instant export to WebM / MP4 via MediaRecorder API.
2. **Voice Recorder & Audio Studio (`voice-recorder`, `audio-cutter`):**
   - In-browser microphone recording with real-time HTML5 Canvas visualizer/waveform.
   - Trimming, silence removal, and volume normalization.
   - Zero-server Web Worker MP3/WAV encoder.
3. **Privacy Metadata Stripper / Exif Cleaner (`metadata-stripper`):**
   - Instant removal of GPS coordinates, device serials, camera models, and timestamps from images before sharing.

### Category 4: Resume Builder Superpowers
1. **Real-Time ATS Score & Keyword Audit Meter:**
   - Real-time scoring algorithm analyzing action verbs, section completeness, word count, and formatting compliance.
   - Target job description paste area to highlight missing keywords and skill gaps.
2. **Matching Cover Letter Generator:**
   - Automatically inherits the contact info, color scheme, and typography from the user's active resume.
   - Produces a matching professional single-page PDF cover letter.
3. **Industry Standard JSON Resume Import/Export:**
   - Full support for the standard `jsonresume.org` schema for seamless profile portability.

### Category 5: Performance, SEO & Offline PWA
1. **Progressive Web App (PWA) Offline Mode:**
   - Service worker caching for 100% offline capability (launch tools on airplanes or remote locations without internet).
   - Installable desktop and mobile app experience.
2. **Dynamic JSON-LD Schema Markup:**
   - SoftwareApplication and HowTo structured data on every tool route for Google Rich Results.
3. **Internationalization (i18n):**
   - Multi-language support (Spanish, French, German, Hindi, Japanese) with lightweight client-side translation dictionaries.

