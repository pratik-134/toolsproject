export interface SimplifiedFraction {
  originalNum: number;
  originalDen: number;
  simplifiedNum: number;
  simplifiedDen: number;
  gcd: number;
  isNegative: boolean;
  isProper: boolean;
  mixedNumber?: {
    whole: number;
    num: number;
    den: number;
  };
  decimal: number;
  percentage: number;
  reciprocal?: {
    num: number;
    den: number;
  };
}

export interface ArithmeticStep {
  description: string;
  expression: string;
}

export interface ArithmeticResult {
  operation: "+" | "-" | "*" | "/";
  f1: { num: number; den: number };
  f2: { num: number; den: number };
  result: SimplifiedFraction;
  steps: ArithmeticStep[];
}

export function calculateGcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

export function calculateLcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / calculateGcd(a, b);
}

export function simplifyFraction(num: number, den: number): SimplifiedFraction {
  if (den === 0) {
    throw new Error("Denominator cannot be zero.");
  }

  const isNeg = (num < 0 && den > 0) || (num > 0 && den < 0);
  const absNum = Math.abs(Math.round(num));
  const absDen = Math.abs(Math.round(den));

  const divisor = calculateGcd(absNum, absDen);
  let sNum = absNum / divisor;
  let sDen = absDen / divisor;

  if (isNeg && sNum !== 0) {
    sNum = -sNum;
  }

  const decimal = num / den;
  const isProper = Math.abs(sNum) < sDen;

  let mixedNumber: SimplifiedFraction["mixedNumber"];
  if (!isProper && sDen !== 1 && sNum !== 0) {
    const whole = Math.floor(Math.abs(sNum) / sDen) * (isNeg ? -1 : 1);
    const remainder = Math.abs(sNum) % sDen;
    if (remainder !== 0) {
      mixedNumber = {
        whole,
        num: remainder,
        den: sDen,
      };
    }
  }

  let reciprocal: SimplifiedFraction["reciprocal"];
  if (num !== 0) {
    reciprocal = {
      num: isNeg ? -absDen / divisor : absDen / divisor,
      den: absNum / divisor,
    };
  }

  return {
    originalNum: num,
    originalDen: den,
    simplifiedNum: sNum,
    simplifiedDen: sDen,
    gcd: divisor,
    isNegative: isNeg,
    isProper,
    mixedNumber,
    decimal: Math.round(decimal * 1000000) / 1000000,
    percentage: Math.round(decimal * 1000000) / 10000,
    reciprocal,
  };
}

export function calculateFractionArithmetic(
  op: "+" | "-" | "*" | "/",
  num1: number,
  den1: number,
  num2: number,
  den2: number
): ArithmeticResult {
  if (den1 === 0 || den2 === 0) {
    throw new Error("Denominator cannot be zero.");
  }
  if (op === "/" && num2 === 0) {
    throw new Error("Cannot divide by a fraction equal to zero.");
  }

  const steps: ArithmeticStep[] = [];
  let rawNum = 0;
  let rawDen = 1;

  if (op === "+" || op === "-") {
    const commonDen = calculateLcm(den1, den2);
    const m1 = commonDen / den1;
    const m2 = commonDen / den2;
    const adjustedNum1 = num1 * m1;
    const adjustedNum2 = num2 * m2;

    steps.push({
      description: "Find the Least Common Denominator (LCD)",
      expression: `LCD(${den1}, ${den2}) = ${commonDen}`,
    });

    steps.push({
      description: "Convert fractions to equivalent common denominator",
      expression: `${num1}/${den1} = ${adjustedNum1}/${commonDen},  ${num2}/${den2} = ${adjustedNum2}/${commonDen}`,
    });

    rawNum = op === "+" ? adjustedNum1 + adjustedNum2 : adjustedNum1 - adjustedNum2;
    rawDen = commonDen;

    steps.push({
      description: `${op === "+" ? "Add" : "Subtract"} numerators over common denominator`,
      expression: `(${adjustedNum1} ${op} ${adjustedNum2}) / ${commonDen} = ${rawNum}/${rawDen}`,
    });
  } else if (op === "*") {
    rawNum = num1 * num2;
    rawDen = den1 * den2;

    steps.push({
      description: "Multiply numerators and multiply denominators",
      expression: `(${num1} × ${num2}) / (${den1} × ${den2}) = ${rawNum}/${rawDen}`,
    });
  } else if (op === "/") {
    // Invert and multiply
    rawNum = num1 * den2;
    rawDen = den1 * num2;

    steps.push({
      description: "Multiply by the reciprocal of the second fraction",
      expression: `(${num1}/${den1}) × (${den2}/${num2}) = (${num1} × ${den2}) / (${den1} × ${num2}) = ${rawNum}/${rawDen}`,
    });
  }

  const simplified = simplifyFraction(rawNum, rawDen);

  if (simplified.gcd > 1) {
    steps.push({
      description: "Simplify to lowest terms by dividing numerator & denominator by GCD",
      expression: `GCD(${Math.abs(rawNum)}, ${Math.abs(rawDen)}) = ${simplified.gcd} → ${simplified.simplifiedNum}/${simplified.simplifiedDen}`,
    });
  }

  return {
    operation: op,
    f1: { num: num1, den: den1 },
    f2: { num: num2, den: den2 },
    result: simplified,
    steps,
  };
}
