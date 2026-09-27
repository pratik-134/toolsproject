import {
  computeNoteStats,
  filterNotes,
  renderMarkdownToHtml,
  DEFAULT_SAMPLE_NOTES,
  MarkdownNote,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Note stats
  const emptyStats = computeNoteStats("");
  if (emptyStats.words !== 0 || emptyStats.chars !== 0) {
    throw new Error("Empty note stats should be 0");
  }

  const sampleStats = computeNoteStats("Hello world from Cleartrix!\nThis is line two.");
  if (sampleStats.words !== 8 || sampleStats.lines !== 2) {
    throw new Error(`Word/line count mismatch: got ${sampleStats.words} words, ${sampleStats.lines} lines`);
  }

  // Test 2: Filter notes
  const notes: MarkdownNote[] = [
    { id: "1", title: "App Architecture", content: "Frontend and Backend", tags: ["tech"], updatedAt: 1 },
    { id: "2", title: "Grocery List", content: "Apples and Oranges", tags: ["personal"], updatedAt: 2 },
  ];

  const techFiltered = filterNotes(notes, "", "tech");
  if (techFiltered.length !== 1 || techFiltered[0]?.id !== "1") {
    throw new Error("Tag filtering failed");
  }

  const queryFiltered = filterNotes(notes, "apples");
  if (queryFiltered.length !== 1 || queryFiltered[0]?.id !== "2") {
    throw new Error("Query search filtering failed");
  }

  // Test 3: Markdown to HTML renderer
  const html = renderMarkdownToHtml("# Heading\n**Bold Text**\n- Item 1");
  if (!html.includes("<h1") || !html.includes("<strong>Bold Text</strong>") || !html.includes("<li")) {
    throw new Error(`renderMarkdownToHtml failed to compile basic markdown: ${html}`);
  }

  // Test 4: Default sample notes
  if (DEFAULT_SAMPLE_NOTES.length < 2) {
    throw new Error("Expected at least 2 default sample notes");
  }

  return true;
}
