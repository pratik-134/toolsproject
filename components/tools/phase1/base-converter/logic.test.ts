import { convertNumberBase } from "./logic";

export function runTests(): boolean {
  // Test 1: Decimal 255 -> Bin 11111111, Oct 377, Hex FF
  const res1 = convertNumberBase("255", 10);
  if (res1.binary !== "11111111" || res1.octal !== "377" || res1.hexadecimal !== "FF") {
    throw new Error(`Test 1 failed: bin=${res1.binary}, hex=${res1.hexadecimal}`);
  }

  // Test 2: Hex FF -> Decimal 255
  const res2 = convertNumberBase("FF", 16);
  if (res2.decimal !== "255") {
    throw new Error(`Test 2 failed: dec=${res2.decimal}`);
  }

  // Test 3: Binary 1010 -> Decimal 10
  const res3 = convertNumberBase("1010", 2);
  if (res3.decimal !== "10") {
    throw new Error(`Test 3 failed: ${res3.decimal}`);
  }

  // Test 4: ASCII printable check (Decimal 65 = 'A')
  const res4 = convertNumberBase("65", 10);
  if (res4.asciiChar !== "A") {
    throw new Error(`Test 4 ASCII failed: ${res4.asciiChar}`);
  }

  // Test 5: Invalid digit for base error handling
  try {
    convertNumberBase("102", 2);
    throw new Error("Should have thrown on invalid binary digit");
  } catch (err: unknown) {
    if (!(err instanceof Error) || !err.message.includes("Invalid")) {
      throw err;
    }
  }

  return true;
}
