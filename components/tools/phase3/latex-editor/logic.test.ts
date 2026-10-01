import {
  validateLatexBrackets,
  latexToSimpleMathML,
  LATEX_SNIPPETS,
  DEFAULT_LATEX_DOC,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Valid brackets
  const validCheck = validateLatexBrackets("\\frac{1}{2} + \\sqrt{x^2 + y^2}");
  if (!validCheck.valid) {
    throw new Error(`Expected valid brackets, got error: ${validCheck.error}`);
  }

  // Test 2: Unclosed bracket
  const invalidCheck = validateLatexBrackets("\\frac{1}{2");
  if (invalidCheck.valid) {
    throw new Error("Expected invalid check for unclosed bracket");
  }

  // Test 3: MathML conversion
  const mathml = latexToSimpleMathML("\\frac{a}{b}");
  if (!mathml.includes("<mfrac>") || !mathml.includes("</mfrac>")) {
    throw new Error(`Failed to generate <mfrac> tag in MathML: ${mathml}`);
  }

  // Test 4: Snippets
  if (LATEX_SNIPPETS.length < 5) {
    throw new Error("Expected at least 5 LaTeX snippets");
  }

  // Test 5: Default doc
  if (!DEFAULT_LATEX_DOC.includes("E = mc^2")) {
    throw new Error("Default latex doc missing Einstein equation");
  }

  return true;
}
