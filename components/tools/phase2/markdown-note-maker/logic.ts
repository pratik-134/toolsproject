/**
 * Markdown Note Maker & Workspace — Pure TypeScript Domain Logic
 * 100% In-Browser Note Organizer & Markdown Compiler
 */

export interface MarkdownNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: number;
}

export interface NoteStats {
  words: number;
  chars: number;
  lines: number;
  readingTimeMin: number;
}

export const DEFAULT_SAMPLE_NOTES: MarkdownNote[] = [
  {
    id: "cleartrix-arch",
    title: "Cleartrix Architecture & Invariants",
    content: `# Cleartrix Platform Architecture

Cleartrix is a privacy-first web utility suite executing **100% client-side** in browser memory.

### Key Invariants:
1. **Zero Server Uploads**: Files never leave user RAM.
2. **Zero Paywalls**: All tools and exports are completely unlocked.
3. **Format Parity**: Pixel-aligned export across DOM, PDF, and Word.

\`\`\`ts
// Strict client-side execution pattern
export function processLocally(data: Uint8Array): Uint8Array {
  return transform(data);
}
\`\`\`

> *"Privacy is not an add-on; it is the default invariant."*`,
    tags: ["architecture", "engineering", "privacy"],
    updatedAt: Date.now(),
  },
  {
    id: "meeting-notes",
    title: "Sprint Review & Planning",
    content: `# Sprint Review & Planning Notes

Date: October 2026  
Attendees: Core Engineering Team

### Agenda Items:
- [x] Shipped 104 verified tools
- [x] 100% green test suites and privacy AST scan
- [ ] Finalize remaining Phase 2 document and converter tools
- [ ] Prepare Phase 3 media transcoding and video utilities

### Next Steps:
- Continue rolling out tools according to the 4-file pattern.
- Verify zero network request regressions.`,
    tags: ["meeting", "planning", "sprint"],
    updatedAt: Date.now() - 3600000,
  },
];

/**
 * Computes words, characters, line counts, and estimated reading time
 */
export function computeNoteStats(content: string): NoteStats {
  const trimmed = content.trim();
  if (!trimmed) {
    return { words: 0, chars: 0, lines: 0, readingTimeMin: 0 };
  }

  const lines = trimmed.split("\n").length;
  const chars = content.length;
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.ceil(words / 200);

  return { words, chars, lines, readingTimeMin };
}

/**
 * Filter and search notes by query string and selected tag
 */
export function filterNotes(
  notes: MarkdownNote[],
  query: string,
  selectedTag?: string
): MarkdownNote[] {
  const q = query.trim().toLowerCase();

  return notes.filter((n) => {
    const matchesTag = !selectedTag || n.tags.includes(selectedTag);
    if (!matchesTag) return false;

    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

/**
 * Lightweight in-browser Markdown to HTML converter for live previews
 */
export function renderMarkdownToHtml(md: string): string {
  let html = md
    // Escape basic HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers (h3, h2, h1)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-foreground mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-foreground mt-4 mb-1.5 pb-1 border-b border-border">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-foreground mt-4 mb-2 pb-1.5 border-b border-border">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-3 my-2 text-muted-foreground italic">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">$1</code>');

  // Unordered list items
  html = html.replace(/^\s*-\s+\[ \]\s+(.*$)/gim, '<li class="flex items-center gap-1.5 my-1 text-xs"><input type="checkbox" disabled class="rounded" /> $1</li>');
  html = html.replace(/^\s*-\s+\[x\]\s+(.*$)/gim, '<li class="flex items-center gap-1.5 my-1 text-xs text-muted-foreground line-through"><input type="checkbox" checked disabled class="rounded" /> $1</li>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 my-0.5 text-xs text-foreground">$1</li>');

  // Paragraphs
  html = html.replace(/\n{2,}/g, '</p><p class="my-2 text-xs text-foreground leading-relaxed">');
  html = `<p class="my-2 text-xs text-foreground leading-relaxed">${html}</p>`;

  return html;
}
