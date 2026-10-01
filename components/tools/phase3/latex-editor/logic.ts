/**
 * LaTeX Equation & Paper Editor — Pure Domain Logic
 * 100% In-Browser Rendering & Validation (Zero Network Uploads)
 */

export interface LatexSnippet {
  id: string;
  label: string;
  latex: string;
  category: "math" | "calculus" | "greek" | "matrices";
}

export const LATEX_SNIPPETS: LatexSnippet[] = [
  { id: "frac", label: "Fraction", latex: "\\frac{a}{b}", category: "math" },
  { id: "sqrt", label: "Square Root", latex: "\\sqrt{x}", category: "math" },
  { id: "pow", label: "Superscript", latex: "x^{2}", category: "math" },
  { id: "sub", label: "Subscript", latex: "x_{i}", category: "math" },
  { id: "int", label: "Definite Integral", latex: "\\int_{a}^{b} f(x)\\,dx", category: "calculus" },
  { id: "sum", label: "Summation", latex: "\\sum_{i=1}^{n} x_i", category: "calculus" },
  { id: "lim", label: "Limit", latex: "\\lim_{x \\to \\infty} f(x)", category: "calculus" },
  { id: "matrix", label: "2x2 Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", category: "matrices" },
  { id: "alpha", label: "α", latex: "\\alpha", category: "greek" },
  { id: "beta", label: "β", latex: "\\beta", category: "greek" },
  { id: "theta", label: "θ", latex: "\\theta", category: "greek" },
  { id: "pi", label: "π", latex: "\\pi", category: "greek" },
  { id: "sigma", label: "σ", latex: "\\sigma", category: "greek" },
];

export const DEFAULT_LATEX_DOC = `% Einstein's Field Equations & Energy Relation
E = mc^2

% Normal Probability Distribution (Gaussian Integral)
f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}

% Quadratic Formula
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
`;

/**
 * Validates LaTeX bracket pairing (parentheses, braces, brackets)
 */
export function validateLatexBrackets(latex: string): { valid: boolean; error?: string } {
  const stack: { char: string; index: number }[] = [];
  const pairs: Record<string, string> = { "{": "}", "[": "]", "(": ")" };
  const closing = new Set(["}", "]", ")"]);

  for (let i = 0; i < latex.length; i++) {
    const ch = latex[i];
    if (!ch) continue;
    if (pairs[ch]) {
      stack.push({ char: ch, index: i });
    } else if (closing.has(ch)) {
      if (stack.length === 0) {
        return { valid: false, error: `Unmatched closing bracket "${ch}" at index ${i}` };
      }
      const last = stack.pop();
      if (!last || pairs[last.char] !== ch) {
        return {
          valid: false,
          error: `Mismatched brackets: expected "${last ? pairs[last.char] : ''}" but found "${ch}" at index ${i}`,
        };
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack.pop()!;
    return { valid: false, error: `Unclosed bracket "${unclosed.char}" at index ${unclosed.index}` };
  }

  return { valid: true };
}

/**
 * Converts common LaTeX math structures to clean, semantic MathML representation
 */
export function latexToSimpleMathML(latex: string): string {
  // Replace fractions: \frac{num}{den} -> <mfrac><mi>num</mi><mi>den</mi></mfrac>
  let mathml = latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "<mfrac><mrow><mn>$1</mn></mrow><mrow><mn>$2</mn></mrow></mfrac>")
    .replace(/\\sqrt\{([^}]+)\}/g, "<msqrt><mrow><mn>$1</mn></mrow></msqrt>")
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '<munderover><mo>∑</mo><mrow><mn>$1</mn></mrow><mrow><mn>$2</mn></mrow></munderover>')
    .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '<munderover><mo>∫</mo><mrow><mn>$1</mn></mrow><mrow><mn>$2</mn></mrow></munderover>')
    .replace(/\\alpha/g, "<mi>α</mi>")
    .replace(/\\beta/g, "<mi>β</mi>")
    .replace(/\\pi/g, "<mi>π</mi>")
    .replace(/\\theta/g, "<mi>θ</mi>")
    .replace(/\\sigma/g, "<mi>σ</mi>")
    .replace(/\\pm/g, "<mo>±</mo>")
    .replace(/\^\{([^}]+)\}/g, "<msup><mrow></mrow><mrow><mn>$1</mn></mrow></msup>")
    .replace(/_\{([^}]+)\}/g, "<msub><mrow></mrow><mrow><mn>$1</mn></mrow></msub>");

  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${mathml}</math>`;
}
