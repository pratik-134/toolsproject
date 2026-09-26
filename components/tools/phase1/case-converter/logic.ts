export interface CaseConversions {
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
  titleCase: string;
  sentenceCase: string;
  alternatingCase: string;
  inverseCase: string;
}

function extractWords(str: string): string[] {
  if (!str) return [];
  // Split on hyphens, underscores, spaces, or camelCase transitions
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function convertCase(input: string): CaseConversions {
  if (!input) {
    return {
      camelCase: "",
      pascalCase: "",
      snakeCase: "",
      kebabCase: "",
      constantCase: "",
      titleCase: "",
      sentenceCase: "",
      alternatingCase: "",
      inverseCase: "",
    };
  }

  const words = extractWords(input);

  // camelCase
  const camelCase = words
    .map((w, idx) =>
      idx === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join("");

  // PascalCase
  const pascalCase = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  // snake_case
  const snakeCase = words.map((w) => w.toLowerCase()).join("_");

  // kebab-case
  const kebabCase = words.map((w) => w.toLowerCase()).join("-");

  // CONSTANT_CASE
  const constantCase = words.map((w) => w.toUpperCase()).join("_");

  // Title Case
  const titleCase = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Sentence case
  const lowerAll = input.toLowerCase();
  const sentenceCase = lowerAll.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

  // Alternating cAsE
  let alternatingCase = "";
  for (let i = 0; i < input.length; i++) {
    alternatingCase += i % 2 === 0 ? input.charAt(i).toLowerCase() : input.charAt(i).toUpperCase();
  }

  // Inverse Case
  let inverseCase = "";
  for (let i = 0; i < input.length; i++) {
    const c = input.charAt(i);
    inverseCase += c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
  }

  return {
    camelCase,
    pascalCase,
    snakeCase,
    kebabCase,
    constantCase,
    titleCase,
    sentenceCase,
    alternatingCase,
    inverseCase,
  };
}
