/**
 * Pure Lorem Ipsum Generator Logic
 * Zero dependencies, client-side execution.
 */

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
  "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis", "praesentium",
  "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores", "quas",
  "molestias", "excepturi", "sint", "obcaecati", "cupiditate", "provident",
  "similique", "mollitia", "animi", "dolorum", "fuga", "harum", "quidem",
  "rerum", "facilis", "expedita", "distinctio", "nam", "libero", "tempore",
  "cum", "soluta", "nobis", "eligendi", "optio", "cumque", "nihil", "impedit",
  "quo", "minus", "maxime", "placeat", "facere", "possimus", "omnis", "voluptas",
  "assumenda", "repellendus", "temporibus", "autem", "quibusdam", "officiis",
  "debitis", "rerum", "necessitatibus", "saepe", "eveniet", "voluptates",
  "repudiandae", "sint", "recusandae", "itaque", "earum", "hic", "tenetur",
  "sapiente", "delectus", "reiciendis", "voluptatibus", "maiores", "alias",
  "consequatur", "perferendis", "doloribus", "asperiores", "repellat"
];

export type LoremType = "paragraphs" | "sentences" | "words" | "list";

export interface LoremOptions {
  type: LoremType;
  count: number;
  startWithLorem: boolean;
  asHtml: boolean;
}

export interface LoremResult {
  text: string;
  wordsCount: number;
  charsCount: number;
  paragraphsCount: number;
}

function getRandomWord(): string {
  const idx = Math.floor(Math.random() * LOREM_WORDS.length);
  return LOREM_WORDS[idx] ?? "lorem";
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(minWords = 6, maxWords = 14): string {
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord());
  }
  return capitalize(words.join(" ")) + ".";
}

function generateParagraph(minSentences = 3, maxSentences = 6): string {
  const count = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(" ");
}

export function generateLorem(options: LoremOptions): LoremResult {
  const { type, count, startWithLorem, asHtml } = options;
  const safeCount = Math.max(1, Math.min(count, 500));

  let rawOutput = "";

  if (type === "words") {
    const words: string[] = [];
    if (startWithLorem && safeCount >= 5) {
      words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      for (let i = 5; i < safeCount; i++) {
        words.push(getRandomWord());
      }
    } else {
      for (let i = 0; i < safeCount; i++) {
        const word = getRandomWord();
        words.push(i === 0 ? capitalize(word) : word);
      }
    }
    rawOutput = words.join(" ") + ".";
    if (asHtml) {
      rawOutput = `<p>${rawOutput}</p>`;
    }
  } else if (type === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      if (i === 0 && startWithLorem) {
        sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
      } else {
        sentences.push(generateSentence());
      }
    }
    rawOutput = sentences.join(" ");
    if (asHtml) {
      rawOutput = `<p>${rawOutput}</p>`;
    }
  } else if (type === "list") {
    const items: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      if (i === 0 && startWithLorem) {
        items.push("Lorem ipsum dolor sit amet");
      } else {
        const words: string[] = [];
        const wCount = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < wCount; j++) {
          words.push(getRandomWord());
        }
        items.push(capitalize(words.join(" ")));
      }
    }
    if (asHtml) {
      rawOutput = `<ul>\n${items.map((it) => `  <li>${it}</li>`).join("\n")}\n</ul>`;
    } else {
      rawOutput = items.map((it) => `• ${it}`).join("\n");
    }
  } else {
    // paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      if (i === 0 && startWithLorem) {
        const rest = generateParagraph(2, 4);
        paragraphs.push(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
            rest
        );
      } else {
        paragraphs.push(generateParagraph());
      }
    }
    if (asHtml) {
      rawOutput = paragraphs.map((p) => `<p>${p}</p>`).join("\n\n");
    } else {
      rawOutput = paragraphs.join("\n\n");
    }
  }

  // Calculate statistics
  const plainText = rawOutput.replace(/<[^>]*>/g, "");
  const wordsMatched = plainText.trim().match(/\b\S+\b/g);
  const wordsCount = wordsMatched ? wordsMatched.length : 0;
  const charsCount = rawOutput.length;
  const paragraphsCount = type === "paragraphs" ? safeCount : 1;

  return {
    text: rawOutput,
    wordsCount,
    charsCount,
    paragraphsCount,
  };
}
