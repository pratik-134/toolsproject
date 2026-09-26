import {
  escapeRtfText,
  generateRtfDocument,
  RTF_TEMPLATES,
} from "./logic";

export function runTests(): boolean {
  // Test 1: RTF special character escaping
  const escaped = escapeRtfText("Backslash \\ Brace { and } Newline\nSpecial: ©");
  if (!escaped.includes("\\\\") || !escaped.includes("\\{") || !escaped.includes("\\}")) {
    throw new Error("RTF escape failed on basic control characters");
  }
  if (!escaped.includes("\\par")) {
    throw new Error("RTF escape failed on newline to \\par");
  }
  if (!escaped.includes("\\u169?")) {
    throw new Error("RTF escape failed on Unicode © symbol");
  }

  // Test 2: RTF Document Generation
  const doc = generateRtfDocument({
    title: "Test Document",
    author: "Engineer",
    body: "Hello World!\nThis is a second line.",
    fontFamily: "Calibri",
    fontSizePt: 14,
  });

  if (!doc.startsWith("{\\rtf1")) {
    throw new Error("RTF document does not start with standard {\\rtf1 magic string");
  }
  if (!doc.endsWith("}")) {
    throw new Error("RTF document is unclosed");
  }
  if (!doc.includes("\\fonttbl") || !doc.includes("Calibri")) {
    throw new Error("RTF document missing font table definition");
  }
  if (!doc.includes("\\fs28")) {
    throw new Error("14pt font was not converted to 28 half-points (\\fs28)");
  }
  if (!doc.includes("Test Document")) {
    throw new Error("RTF document missing title metadata");
  }

  // Test 3: Templates
  if (Object.keys(RTF_TEMPLATES).length < 3) {
    throw new Error("Expected at least 3 RTF templates");
  }

  return true;
}
