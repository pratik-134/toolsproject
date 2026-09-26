/**
 * Pure Client-Side Scientific Calculator Logic
 * Zero eval(), safe recursive descent expression evaluator.
 */

export type AngleMode = "deg" | "rad";

export interface EvaluationResult {
  result: number;
  formatted: string;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial requires non-negative integer");
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 170); i++) {
    res *= i;
  }
  return res;
}

export function evaluateExpression(expr: string, angleMode: AngleMode = "deg"): number {
  let clean = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/\s+/g, "");

  if (!clean) return 0;

  let pos = 0;

  function peek(): string {
    return clean[pos] ?? "";
  }

  function get(): string {
    return clean[pos++] ?? "";
  }

  function parseExpression(): number {
    let x = parseTerm();
    while (true) {
      if (peek() === "+") {
        get();
        x += parseTerm();
      } else if (peek() === "-") {
        get();
        x -= parseTerm();
      } else {
        return x;
      }
    }
  }

  function parseTerm(): number {
    let x = parseFactor();
    while (true) {
      if (peek() === "*") {
        get();
        x *= parseFactor();
      } else if (peek() === "/") {
        get();
        const divisor = parseFactor();
        if (divisor === 0) throw new Error("Division by zero");
        x /= divisor;
      } else if (peek() === "%") {
        get();
        x %= parseFactor();
      } else {
        return x;
      }
    }
  }

  function parseFactor(): number {
    let x = parsePrimary();
    while (peek() === "^" || peek() === "!") {
      if (peek() === "^") {
        get();
        x = Math.pow(x, parseFactor());
      } else if (peek() === "!") {
        get();
        x = factorial(x);
      }
    }
    return x;
  }

  function parsePrimary(): number {
    if (peek() === "+") {
      get();
      return parsePrimary();
    }
    if (peek() === "-") {
      get();
      return -parsePrimary();
    }

    if (peek() === "(") {
      get(); // '('
      const x = parseExpression();
      if (peek() === ")") get(); // ')'
      return x;
    }

    // Identifiers (functions and constants)
    if (/[a-zA-Z]/.test(peek())) {
      let name = "";
      while (/[a-zA-Z0-9]/.test(peek())) {
        name += get();
      }
      name = name.toLowerCase();

      if (name === "pi") return Math.PI;
      if (name === "e") return Math.E;

      if (peek() === "(") {
        get();
        const arg = parseExpression();
        if (peek() === ")") get();

        switch (name) {
          case "sin": {
            const rad = angleMode === "deg" ? (arg * Math.PI) / 180 : arg;
            return Math.sin(rad);
          }
          case "cos": {
            const rad = angleMode === "deg" ? (arg * Math.PI) / 180 : arg;
            return Math.cos(rad);
          }
          case "tan": {
            const rad = angleMode === "deg" ? (arg * Math.PI) / 180 : arg;
            return Math.tan(rad);
          }
          case "asin": {
            const res = Math.asin(arg);
            return angleMode === "deg" ? (res * 180) / Math.PI : res;
          }
          case "acos": {
            const res = Math.acos(arg);
            return angleMode === "deg" ? (res * 180) / Math.PI : res;
          }
          case "atan": {
            const res = Math.atan(arg);
            return angleMode === "deg" ? (res * 180) / Math.PI : res;
          }
          case "sqrt":
            if (arg < 0) throw new Error("Square root of negative number");
            return Math.sqrt(arg);
          case "cbrt":
            return Math.cbrt(arg);
          case "log":
          case "log10":
            if (arg <= 0) throw new Error("Log of non-positive number");
            return Math.log10(arg);
          case "ln":
            if (arg <= 0) throw new Error("Ln of non-positive number");
            return Math.log(arg);
          case "abs":
            return Math.abs(arg);
          default:
            throw new Error(`Unknown function: ${name}`);
        }
      }
    }

    // Number literals
    let numStr = "";
    while (/[0-9.]/.test(peek())) {
      numStr += get();
    }

    if (numStr) {
      const val = parseFloat(numStr);
      if (isNaN(val)) throw new Error(`Invalid number: ${numStr}`);
      return val;
    }

    throw new Error(`Unexpected character: '${peek()}'`);
  }

  const result = parseExpression();
  if (pos < clean.length) {
    throw new Error(`Unexpected syntax at position ${pos}`);
  }

  return Number(result.toFixed(10));
}
