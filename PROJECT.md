# Cleartrix: Master Project Architecture, Invariants & AI Developer Guide

> **Product:** Cleartrix (`https://cleartrix.com`)  
> **Umbrella Platform:** Privacy-first, in-browser suite of 172+ tools across all 11 categories  
> **Flagship Product:** Cleartrix Resume Builder (`/editor`, `/dashboard`) with 20 Vector PDF & Word DOCX templates  
> **Primary Stack:** Next.js 15.5 (App Router, React 18, TypeScript 5.7, Tailwind CSS 3.4), Zustand 4.5, Zod 3.23, Radix UI primitives (`@radix-ui/react-select`), Lucide Icons  
> **AI / Media Boost:** In-browser WebAssembly (Pyodide, Web Workers, Canvas, Web Audio, Web Crypto) + Optional Server Microservice (Python FastAPI for heavyweight Phase 4 models)  
> **Brand & Storage Configuration:** `lib/brand.ts` (`BRAND` object), `ct_` localStorage prefix with non-destructive fallback migration  
> **Purpose of this File:** Single source of truth for all architectural invariants, design system guidelines, tool development workflows, resolved gotchas, and verification commands. Every developer and AI assistant working on this codebase must follow the rules in this document without deviation.

---

## 1. Core Mission & Non-Negotiable Invariants

Cleartrix is one unified, lightning-fast web platform hosting 172+ everyday tools for PDFs, documents, images, developer utilities, calculators, codes, media, and zero-knowledge cloud sharing. The defining differentiator is **absolute privacy: user files and data are processed directly inside the client browser and never uploaded to any remote server.**

### The 8 Non-Negotiable Invariants (Never Break These):

1. **100% In-Browser Privacy by Default (Zero Server Uploads):**
   - For all client tools (`runtime: 'client'` or `'client-worker'`), user files and text must **never** leave device RAM.
   - Strictly forbidden in client tools: `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSockets carrying user payload, or form POSTs.
   - Enforce Content-Security-Policy: `connect-src 'self'`.
   - Zero telemetry tracking, zero third-party analytics pixels, zero external API logging of user content.
   - Validated automatically via `npm run test:privacy`.

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
   - Any tool performing financial or taxation calculations (e.g. mortgage, sales tax, inflation, salary paycheck, loan, salary tax) **must** display the standard statutory financial disclaimer.
   - Any tool calculating health or body metrics (e.g. BMI, BMR/TDEE, water intake, calories) **must** display the standard medical disclaimer.

7. **Strict Git Permission Invariant:**
   - **Never run any git command without explicit user permission.** This includes `git add`, `git commit`, `git push`, `git status`, `git checkout`, `git diff`, etc. All changes must remain in the working tree until explicitly authorized by the user.

8. **Zero Emojis in UI Components & Output:**
   - Maintain a clean, professional, enterprise-grade interface. Never use emoji characters in buttons, headers, inputs, alerts, badges, or assistant responses. Always use standardized Lucide icons for visual affordance.

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
│   ├── sitemap.ts                          # Automated dynamic sitemap for all 169+ tools and hubs
│   ├── robots.ts                           # Search engine crawling rules
│   └── tools/                              # Dynamic Tools Engine
│       ├── page.tsx                        # Complete tools directory hub (live search + category filters)
│       ├── [category]/page.tsx             # Category SEO hub listing all tools in that category
│       └── [category]/[slug]/page.tsx      # Tool workspace (renders dynamic ToolView)
├── components/
│   ├── Navbar.tsx                          # Header navbar with Mega Menu trigger, search shortcut & mobile drawer
│   ├── NavbarMegaMenu.tsx                  # Two-pane desktop mega menu (all 11 categories + search + tools grid)
│   ├── Footer.tsx                          # Universal footer with category sitemap & legal links
│   ├── BrandLogo.tsx                       # Brand logo component (umbrella brand & resume builder)
│   ├── ThemeToggle.tsx                     # System/Dark/Light theme switch
│   ├── ui/                                 # Standardized design system component primitives
│   │   ├── select.tsx                      # Universal Radix UI Select wrapper (replaces native HTML selects)
│   │   ├── button.tsx                      # Reusable Button primitive with variants
│   │   ├── input.tsx                       # Input primitive
│   │   └── dialog.tsx                      # Modal Dialog primitive
│   ├── tool-shell/                         # Reusable standardized tool UI components
│   │   ├── ToolLayout.tsx                  # Tool container (H1, intro, FAQs, related tools)
│   │   ├── UploadBox.tsx                   # Drag-and-drop file upload with in-memory guard
│   │   ├── ProgressBar.tsx                 # Processing progress bar with cancel action
│   │   ├── ResultPanel.tsx                 # Output action bar (Copy, Download, Reset)
│   │   └── ErrorState.tsx                  # User-friendly error boundary & recovery card
│   └── tools/
│       ├── ToolView.tsx                    # Dynamic client-side tool loader & RSC boundary
│       ├── CommandPalette.tsx              # Global Ctrl+K / Cmd+K instant tool search dialog
│       ├── engines/                        # Shared multi-tool converter engines (ImagesToPdfEngine, etc.)
│       ├── pilot/                          # Pilot tools (qr-generator, barcode-generator, etc.)
│       ├── phase1/                         # Shipped modular tool packages (34 tools)
│       ├── phase2/                         # Shipped modular tool packages (image, pdf, document tools)
│       └── phase3/                         # Shipped advanced suites (PDF Editor, Recorders, Builders, Creative)
├── lib/
│   ├── brand.ts                            # Canonical brand configuration (name, domain, storage prefix)
│   ├── tool-icons.ts                       # Dynamic icon resolver and category fallback icon mappings
│   ├── empty-module.js                     # Webpack stub aliasing optional Node modules (canvas, encoding)
│   ├── registry/                           # Tool catalog source of truth (pure serializable data)
│   │   ├── types.ts                        # ToolDefinition, CategoryId, CategoryDefinition
│   │   ├── categories.ts                   # 11 category definitions with metadata and IDs
│   │   └── tools.ts                        # Central registry containing all 169 tool definitions
│   ├── store/                              # State management
│   │   ├── migrate-brand.ts                # Non-destructive localStorage key migration to ct_ prefix
│   │   ├── storage-utils.ts                # Safe localStorage wrappers with quota guards
│   │   ├── use-resume-store.ts             # Active resume document state, history, undo/redo
│   │   └── use-resume-index-store.ts       # Multi-resume index CRUD
│   ├── pdf/                                # 20 vector PDF templates (@react-pdf/renderer)
│   ├── docx/                               # 20 native Word templates (docx OOXML package generator)
│   └── import/                             # In-browser PDF & Word resume parser
├── public/
│   ├── brand/                              # Official ClearTrix identity assets (logos, icons)
│   └── images/samples/                     # Original copyright-free bundled sample photos and assets
├── scripts/                                # Verification & Quality Assurance Suite
│   ├── test-tools.ts                       # Unit test runner executing all 172 tool logic.test.ts suites
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

Every tool in Cleartrix is built using this strict, modular 4-file pattern. Domain logic is strictly separated from React components:

### 1. `components/tools/<phase>/<slug>/logic.ts`
- **Rule:** Contains **only pure TypeScript functions and interfaces**.
- **Forbidden:** Zero React hooks, zero JSX, zero DOM manipulation, zero `window` or `document` calls.
- **Purpose:** All mathematical, parsing, encoding, conversion, or formatting algorithms live here so they can be unit-tested in isolation in Node.js or Web Workers.

### 2. `components/tools/<phase>/<slug>/logic.test.ts`
- **Rule:** Exports `runTests(): boolean | Promise<boolean>`.
- **Purpose:** Executes deterministic test vectors and edge cases (empty strings, zero, boundary numbers, corrupted inputs). Throws an informative `Error` if any assertion fails.

### 3. `components/tools/<phase>/<slug>/index.tsx`
- **Rule:** Starts with `"use client";`.
- **Features:**
  - Fully responsive on mobile, tablet, and desktop.
  - High-contrast Dark/Light mode support using standard Tailwind tokens.
  - Universal `@radix-ui/react-select` component wrapper for all dropdown menus.
  - Text wrap prevention (`whitespace-nowrap`, `truncate`) on action buttons, chips, and table headers.
  - Clean layout without redundant badges.
  - One-click **Copy to Clipboard** with visual checkmark feedback.
  - One-click **Download** button where applicable.
  - Statutory disclaimer box if the tool calculates financial, medical, or legal data.

### 4. Registration (The 3 Connection Points)
1. **`lib/registry/tools.ts`**: Add tool metadata object with slug, name, category, phase, runtime, SEO, FAQs, and related tools.
2. **`components/tools/ToolView.tsx`**: Add dynamic import into `TOOL_COMPONENTS` with `ssr: false` and loading skeleton.
3. **`scripts/test-tools.ts`**: Import and invoke the unit test function inside `runAllTests()`.

---

## 4. Design System & UI/UX Guidelines

### Unified Select Component (`components/ui/select.tsx`)
- Standardized wrapper over `@radix-ui/react-select`.
- Used across the entire site (Passport Photo Generator, Invoice Generator, Estimate Quote Builder, Certificate Generator, Salary Tax Calculator, ImagesToPdfEngine, HTML to PDF, DOCX to PDF, Markdown to PDF, etc.).
- Eliminates jarring native browser `<select>` controls in favor of accessible, keyboard-navigable, theme-aware dropdown overlays with smooth animations and checkmark indicators.

### Layout, Spacing & Text Wrapping Invariants
- Action buttons, badges, status chips, and table headers must enforce `whitespace-nowrap` and `truncate` where appropriate to prevent congested or broken multi-line wraps.
- Save / Favorite tool icon action is positioned in the top-right corner of tool banners (minimalist icon button, no bulky borders or verbose text).
- Redundant badges (such as "Files never leave your browser • 100% Client-Side") are removed from tool views to keep interfaces uncluttered.

### Standard Tailwind Color Tokens
- **Standard Tailwind Grays Only:** Always use standard Tailwind slate colors:
  - Backgrounds: `bg-white dark:bg-slate-900`
  - Cards & Panels: `bg-slate-50/80 dark:bg-slate-800/90`
  - Borders: `border-slate-200 dark:border-slate-700/80`
  - Body Text: `text-slate-700 dark:text-slate-200`
  - Headings: `text-slate-900 dark:text-white`
  - Secondary/Muted: `text-slate-500 dark:text-slate-400`
- **STRICT PROHIBITION:** Never invent custom color classes like `slate-850` or `slate-750` that do not exist in Tailwind defaults.

### Asset & Sample Image Architecture
- All sample and demo images are stored locally in [`public/images/samples/`](file:///c:/Users/dell/OneDrive/Desktop/mindkit/public/images/samples):
  - `passport-sample.jpg`: High-resolution studio biometric portrait with neutral background.
  - `landscape-sample.jpg`: Vivid alpine lake landscape with high dynamic range for filter testing.
  - `architecture-sample.jpg`: Modern corporate architecture photography for watermark testing.
  - `lighthouse-sample.jpg`: Coastal lighthouse with clear vertical orientation for rotation and flip testing.
  - `meme-cat-sample.jpg`: Expressive cat photograph tailored for meme captioning.
  - `app-icon-sample.jpg`: 3D geometric prism logo mark for multi-resolution favicon generation.
- All sample assets are 100% original, copyright-free, and bundled locally with zero external network or CDN calls.
- All output previews, exported PDFs, and exported images are clean and unbranded with zero watermarks.

---

## 5. Shipped Flagship Tools & Advanced Features

### 1. Passport Photo Generator (`passport-photo-generator`)
- **Biometric Specifications:** Supports 10+ official standards (US 2x2", UK 35x45mm, Schengen/EU 35x45mm, India Passport/Visa, Canada 50x70mm, Australia 35x45mm, Japan 35x45mm, China 33x48mm, UAE 40x50mm, Singapore 35x45mm, PAN Card stamp size).
- **Multi-up Print Sheet Formats:** Standard 4x6" (10x15cm), 5x7" (13x18cm), A4, US Letter, and Single 1-up cut size at exact 300 DPI physical scale.
- **Customizable Photo Border:** Toggle border on/off; select thickness (1px Thin, 2px Medium, 3px Thick); select color (Light Gray, Slate, Dark, White).
- **Corner Crop Guides:** Toggle scissors cut guide marks on/off independently.
- **Customizable Photo Spacing (Gap):** Select Auto (Fit Max) or exact millimeter spacing (0 mm seamless to 10 mm with 0.5 mm steps) with dynamic grid recalculation.
- **Retouch & Biometric Guides:** Brightness, contrast, saturation adjustments, 90-degree rotation, horizontal flip, drag/pan, zoom, live webcam snapshot with countdown, and official exam Name & Date strip.
- **Clean Unbranded Exports:** Zero watermark branding on interactive preview, exported PDF, exported JPG, or browser print dialog.

### 2. Full In-Browser PDF Editor Suite (`pdf-editor`)
- **AcroForm Capabilities:** Create, inspect, and fill interactive text fields, checkboxes, and radio buttons; export form data as FDF and JSON; flatten forms into static page vectors.
- **Vector Annotations & Redaction:** Freehand drawing, text callouts, shapes, highlighter overlays, whiteout masking, and permanent vector redaction with metadata sanitization.
- **Document Comparison:** Visual pixel-by-pixel diff engine between two PDF revisions with side-by-side and highlight overlays.
- **Search & Replace:** Find text across documents with automatic whiteout and font-matched vector text injection.
- **Multi-Format Conversions:** Client-side conversion to Plain Text, HTML, CSV/Excel tabular data, and Word (.docx).
- **Bates Numbering & Digital Signatures:** Document-wide sequential numbering and cryptographic/drawn signatures.

### 3. Business & Document Builders Suite
- **Invoice & Receipt Generator (`invoice-receipt-generator`):** Professional invoice and receipt builder with line items, tax rates, discounts, custom currency symbols, notes, and print-ready PDF export.
- **Estimate & Quote Builder (`estimate-quote-builder`):** Quotation and project cost estimates with itemized breakdowns, client terms, and downloadable PDF quotes.
- **Certificate & Diploma Generator (`certificate-diploma-generator`):** Award certificates and diplomas with multiple frame templates, customizable gold/silver/bronze seals, recipient credentials, and signature lines.
- **Proposal Builder (`proposal-builder`):** Client project proposals with executive summaries, project scope, deliverable milestones, pricing tables, and formal signature blocks.
- **Resume Builder (`resume-builder`):** Flagship ATS-compliant builder with 20 distinct design styles, instant preview, import parser, and 3-way DOM/PDF/Word export.

### 4. Video & Screen Capture Suite
- **Desktop Screen Recorder (`desktop-screen-recorder`):** In-browser screen recording via `navigator.mediaDevices.getDisplayMedia` with microphone audio and WebM/MP4 export.
- **Web Tab Recorder (`web-tab-recorder`):** Targeted single-browser-tab recording with system audio capture.
- **Webcam Overlay Recorder (`webcam-overlay-recorder`):** Picture-in-picture draggable circular or rounded webcam overlay recorded simultaneously with desktop video.

### 5. Creative & Social Media Canvas Suite
- **Social Post Maker (`social-post-maker`):** Square (1:1) and portrait (4:5) social media cards with gradient palettes, typography controls, and category badges.
- **Story & Reels Maker (`story-reels-maker`):** 9:16 mobile canvas builder for stories and reels with interactive sticker callouts (New Post, Link in Bio, Tap Here, Limited Offer).
- **Chart & Graph Visualizer (`chart-graph-visualizer`):** In-browser chart builder supporting bar charts, line graphs, pie charts, and radar graphs with instant PNG export.
- **Meme Caption Generator (`meme-caption-generator`):** Classic top and bottom Impact text captions with customizable stroke outlines, shadow offsets, and uppercase toggles.
- **High-Res Code Snapshot Studio (`code-snapshot-studio`):** In-browser Carbon/Ray-grade code screenshot studio supporting 10 languages, 7 themes (Dracula, Monokai, One Dark, Nord, Synthwave, GitHub Dark/Light), macOS/Windows window frames, line numbers, 1-click clipboard image copy, and 1x/2x/3x retina PNG & SVG export.
- **Vector SVG Wave & Pattern Studio (`svg-pattern-generator`):** In-browser parametric SVG generator for wave dividers, layered curves, organic blobs, mesh gradients, and dot matrices with 1-click SVG and CSS data URI exports.
- **Interactive JSON/YAML Graph & Tree Visualizer (`json-graph-visualizer`):** In-browser 2D node-tree diagram explorer for complex JSON/YAML schemas with live search filtering, JSONPath copy, and SVG graph export.
- **Harmonic Color Palette Studio & WCAG Contrast Checker (`color-palette-generator`):** In-browser Coolors/Adobe-grade color palette generator with Complementary, Analogous, Triadic, Monochromatic, Split-Complementary, and Tetradic harmonies, individual color locking, live W3C WCAG 2.1 AA/AAA contrast ratio compliance, Brettel-Viénot color blindness vision simulation (Protanopia, Deuteranopia, Tritanopia, Achromatopsia), and 1-click export to CSS variables, Tailwind configs, and JSON.
- **CSS Mesh Gradient Studio & Generator (`css-mesh-gradient-generator`):** In-browser Meshgradient/CSS Hero-grade multi-point radial mesh studio with draggable color coordinates, spread radius and blur sliders, aesthetic presets (Aurora, Sunset, Cyberpunk, Spring), and 1-click copy for pure CSS, Tailwind arbitrary classes, and scalable vector SVG wallpaper export.
- **Smart Image Background Remover (`image-background-remover`):** In-browser Remove.bg/PhotoRoom alternative performing local canvas pixel distance segmentation, edge feathering, and cutouts with transparent, solid, or gradient backgrounds.
- **Multi-Format Visual Diff Studio (`visual-diff-studio`):** In-browser Diffchecker Pro alternative featuring dual-pane split view, unified patch export, synchronized scrolling, and token-level micro-diff word highlights.
- **Interactive RegEx Visualizer & Rail Diagram (`regex-visualizer`):** In-browser RegExr railroad diagram visualizer with semantic AST tokens, capture group explanations, and live regex match testing.
- **PDF Watermark & Page Stamp Studio (`pdf-watermark-stamper`):** In-browser multi-page PDF stamper with vector text watermarks, opacity sliders, diagonal rotation angles, and page range filtering.

### 6. 38 Converter Engine Tools
- **Canvas Image Converters:** WebP to PNG, WebP to JPG, PNG to JPG, JPG to PNG, SVG to PNG, BMP to JPG, BMP to PNG, GIF to PNG, Image to ICO, HEIC to JPG.
- **Document Converters:** JPG to PDF, PDF to JPG, PDF to PNG, PDF to Text, Image to Text (OCR), DOCX to PDF, HTML to PDF, Markdown to PDF, Excel to PDF, PowerPoint to PDF, PDF to DOCX.
- **FFmpeg Media Converters:** MP4 to MP3, MOV to MP4, WAV to MP3, WEBM to MP4, M4A to MP3, FLAC to MP3, GIF to MP4, MKV to MP4, AVI to MP4, FLV to MP4, OGG to MP3, AAC to MP3, WMA to MP3.
- **Developer Data Converters:** TSV to CSV, CSV to Excel, XML to CSV, JSON to TypeScript, Text to Binary, Markdown to HTML, HTML to Markdown, Color Converter, Roman Numeral Converter, Number to Words.

---

## 6. The 11 Platform Categories & 181 Shipped Tools

The platform contains 181 registered and fully typed tools across 11 official categories:

### 1. Document & PDF (`document-pdf` — 37 tools)
`pdf-editor`, `ats-resume-checker`, `resume-import-viewer`, `pdf-merger`, `pdf-splitter`, `pdf-page-rotator`, `pdf-page-organizer`, `pdf-compressor`, `pdf-bates-stamper`, `pdf-flattener`, `pdf-form-extractor`, `pdf-form-builder`, `pdf-digital-signer`, `markdown-to-pdf`, `html-to-pdf`, `direct-txt-editor`, `direct-markdown-editor`, `direct-html-editor`, `pdf-redaction-tool`, `direct-rtf-creator`, `direct-docx-editor`, `pdf-annotator`, `excel-to-pdf`, `docx-to-pdf`, `pdf-to-docx`, `pdf-encryptor`, `pdf-decryptor`, `powerpoint-to-pdf`, `jpg-to-pdf`, `pdf-to-jpg`, `pdf-to-png`, `pdf-to-text`, `latex-editor`, `camera-to-pdf-scanner`, `job-keyword-matcher`, `pdf-page-numberer`, `pdf-watermark-stamper`.

### 2. Developer, Data & Code (`developer` — 35 tools)
`json-formatter`, `base64-converter`, `csv-json-converter`, `hash-generator`, `url-encoder`, `html-beautifier`, `text-diff`, `regex-tester`, `html-entity-encoder`, `json-xml-converter`, `base-converter`, `unicode-normalizer`, `sql-formatter`, `hmac-generator`, `json-yaml-converter`, `json-schema-validator`, `code-minifier`, `chmod-calculator`, `sql-dump-to-csv`, `excel-to-json-csv`, `markdown-to-html`, `html-to-markdown`, `csv-to-excel`, `json-to-typescript`, `xml-to-csv`, `text-to-binary`, `tsv-to-csv`, `jwt-decoder`, `cron-expression-builder`, `curl-to-code-converter`, `code-snapshot-studio`, `json-graph-visualizer`, `color-palette-generator`, `visual-diff-studio`, `regex-visualizer`.

### 3. Calculators (`calculators` — 34 tools)
`mortgage-calculator`, `compound-interest-calculator`, `percentage-calculator`, `bmi-calculator`, `date-calculator`, `age-calculator`, `discount-calculator`, `sales-tax-calculator`, `freelance-rate-calculator`, `calorie-calculator`, `water-intake-calculator`, `auto-loan-calculator`, `scientific-calculator`, `aspect-ratio-calculator`, `bmr-tdee-calculator`, `inflation-calculator`, `ip-subnet-calculator`, `statistics-calculator`, `fraction-simplifier`, `geometry-calculator`, `time-card-calculator`, `world-clock-converter`, `bandwidth-calculator`, `sip-calculator`, `retirement-401k-calculator`, `debt-payoff-calculator`, `roi-calculator`, `profit-margin-calculator`, `break-even-calculator`, `payroll-paycheck-calculator`, `body-fat-calculator`, `target-heart-rate-calculator`, `pregnancy-due-date-calculator`, `salary-tax-calculator`.

### 4. Image Tools (`image` — 30 tools)
`image-converter`, `aspect-ratio-cropper`, `canvas-resizer`, `batch-image-compressor`, `exif-stripper`, `image-base64-converter`, `svg-minifier`, `favicon-generator`, `image-rotator-flipper`, `photo-filter-studio`, `image-watermarker`, `webp-to-png`, `webp-to-jpg`, `png-to-jpg`, `jpg-to-png`, `svg-to-png`, `image-to-ico`, `heic-to-jpg`, `image-to-text`, `bmp-to-jpg`, `bmp-to-png`, `gif-to-png`, `social-post-maker`, `story-reels-maker`, `chart-graph-visualizer`, `meme-caption-generator`, `passport-photo-generator`, `svg-pattern-generator`, `css-mesh-gradient-generator`, `image-background-remover`.

### 5. Everyday Utilities (`utilities` — 13 tools)
`word-counter`, `password-generator`, `case-converter`, `lorem-generator`, `duplicate-line-remover`, `unit-converter`, `epoch-converter`, `checksum-verifier`, `archive-extractor`, `archive-packer`, `color-converter`, `roman-numeral-converter`, `number-to-words`.

### 6. Video & Screen Capture (`video` — 10 tools)
`desktop-screen-recorder`, `web-tab-recorder`, `webcam-overlay-recorder`, `mp4-to-mp3`, `mov-to-mp4`, `webm-to-mp4`, `gif-to-mp4`, `mkv-to-mp4`, `avi-to-mp4`, `flv-to-mp4`.

### 7. Audio & Voice (`audio` — 6 tools)
`wav-to-mp3`, `m4a-to-mp3`, `flac-to-mp3`, `ogg-to-mp3`, `aac-to-mp3`, `wma-to-mp3`.

### 8. Builders & Generators (`builders` — 5 tools)
`resume-builder`, `invoice-receipt-generator`, `estimate-quote-builder`, `certificate-diploma-generator`, `proposal-builder`.

### 9. Codes & Barcodes (`codes` — 4 tools)
`qr-generator`, `barcode-generator`, `barcode-scanner`, `qr-scanner`.

### 10. Security & Privacy (`security` — 4 tools)
`file-encryptor`, `file-decryptor`, `steganography-tool`, `metadata-stripper`.

### 11. URL & Cloud (`url-cloud` — planned Phase 5)
Burn-after-read secret sharer, client pastebin, link protector.

---

## 7. Solved Engineering Lessons & Gotchas

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
   - Always execute npm and test scripts via: `cmd /c npm run <command>` or `cmd /c npx <package>`.

7. **Strict Git Invariant:**
   - Never execute any git command without explicit user permission.

---

## 8. Quality Assurance & Verification Commands

Execute the verification suite via `cmd /c` on Windows:

```bash
# TypeScript Typecheck (0 errors)
cmd /c npm run typecheck

# Tool Logic Unit Tests (169 tools passing)
cmd /c npm run test:tools

# Registry & Schema Integrity Check (169 tools, 11 categories)
cmd /c npx tsx scripts/test-registry.ts

# Privacy & Zero-Leak Network Scanner
cmd /c npx tsx scripts/test-privacy.ts

# Resume Templates Verification
cmd /c npx tsx scripts/test-pdf-templates.tsx
cmd /c npx tsx scripts/test-docx-templates.ts
cmd /c npx tsx scripts/test-multi-resume-store.ts
cmd /c npx tsx scripts/test-import-parser.ts

# Full Master Verification Suite
cmd /c npm run check

# Production Build & Static Route Prerender
cmd /c npm run build
```

---

## 9. Progressive Web App (PWA) & Offline Execution Architecture

Cleartrix functions as a fully offline Progressive Web App, enabling all 172+ client-side tools to run without an active internet connection:

1. **Service Worker (`public/sw.js`):**
   - **Cache Strategy:** Network-first with cache fallback for navigation HTML requests; Cache-first for static scripts, fonts, stylesheets, and images.
   - **Precached Assets:** App shell, icons, manifest, `/offline`, `/tools`, and `/editor`.
   - **Offline Fallback (`app/offline/page.tsx`):** Served whenever an uncached route is requested while offline, confirming 100% in-browser RAM execution.

2. **PWA Provider (`components/pwa/PwaProvider.tsx`):**
   - Registers `/sw.js` in production environments.
   - Monitors online/offline network transitions (`navigator.onLine`, `online`/`offline` window events) and renders non-intrusive status toasts.
   - Captures `beforeinstallprompt` and manages standalone window mode install prompts.

3. **Install Button (`components/pwa/InstallButton.tsx`):**
   - Integrated into the global footer and available across key workspaces, allowing users to install Cleartrix as a native desktop or mobile application.

---

## 10. Client-Side Multi-Tool Pipeline & Data Hand-Off Architecture

Cleartrix enables zero-upload, 100% in-browser data transfer between compatible tools:

1. **Pipeline Engine (`lib/pipeline/handoff.ts`):**
   - High-affinity tool workflow matrix (`PIPELINE_WORKFLOW_MAP`) defining intelligent downstream targets (e.g. `curl-to-code-converter` -> `client-pastebin` / `burn-after-read-secret`; `json-formatter` -> `json-yaml-converter` / `json-to-typescript`).
   - Browser storage session buffer (`ct_pipeline_active_handoff`) with 15-minute TTL invalidation.
   - Zero-network privacy: data stays strictly in local browser memory without intermediate server uploads.

2. **Sender Component (`components/pipeline/SendToPipelineButton.tsx`):**
   - Renders a clean "Send to Next Tool" dropdown across output toolbars.
   - Packages text or file data, saves the handoff payload, and navigates seamlessly to the destination tool.

3. **Receiver Component (`components/pipeline/PipelineReceiverBanner.tsx`):**
   - Mounted globally within `ToolLayout.tsx` above all 172 tool workspaces.
   - Detects incoming handoffs targeting the active tool slug.
   - Displays incoming data preview with one-click "Apply Input", "Copy Data", and "Dismiss" controls.
   - Dispatches a `pipeline-apply-data` window event for tools that support direct programmatic state population.


