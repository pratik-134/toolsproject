import { generateLorem } from "./logic";

export function runTests(): boolean {
  // Test 1: Generate words with startWithLorem
  const wordsRes = generateLorem({
    type: "words",
    count: 25,
    startWithLorem: true,
    asHtml: false,
  });
  if (wordsRes.wordsCount !== 25) {
    throw new Error(`Expected 25 words, got ${wordsRes.wordsCount}`);
  }
  if (!wordsRes.text.startsWith("Lorem ipsum dolor sit amet")) {
    throw new Error(`Expected start with Lorem ipsum, got: ${wordsRes.text.slice(0, 30)}`);
  }

  // Test 2: Generate HTML paragraphs
  const htmlRes = generateLorem({
    type: "paragraphs",
    count: 3,
    startWithLorem: true,
    asHtml: true,
  });
  if (!htmlRes.text.startsWith("<p>Lorem ipsum")) {
    throw new Error(`Expected HTML paragraph tag, got: ${htmlRes.text.slice(0, 30)}`);
  }
  const pCount = (htmlRes.text.match(/<p>/g) || []).length;
  if (pCount !== 3) {
    throw new Error(`Expected 3 <p> tags, got ${pCount}`);
  }

  // Test 3: Generate list
  const listRes = generateLorem({
    type: "list",
    count: 5,
    startWithLorem: false,
    asHtml: true,
  });
  if (!listRes.text.startsWith("<ul>") || !listRes.text.endsWith("</ul>")) {
    throw new Error(`Expected <ul> wrap for HTML list, got: ${listRes.text}`);
  }

  return true;
}
