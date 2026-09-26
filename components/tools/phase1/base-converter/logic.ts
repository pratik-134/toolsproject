/**
 * Number Base & Radix Converter Logic
 * Supports BigInt for large integers, custom bases (2-36), and bitwise representations.
 */

export interface BaseConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
  customBaseValue?: string;
  customBase?: number;
  bitCount: number;
  byteCount: number;
  asciiChar?: string;
  binaryGrouped: string; // 8-bit space grouped
  hexGrouped: string; // 2-char space grouped
}

export function convertNumberBase(
  input: string,
  fromBase: number,
  customTargetBase: number = 32
): BaseConversionResult {
  const trimmed = input.trim().replace(/\s+/g, "");

  if (!trimmed) {
    throw new Error("Input is empty");
  }

  if (fromBase < 2 || fromBase > 36) {
    throw new Error("Source base must be between 2 and 36");
  }

  // Parse input to BigInt using custom radix parser
  let bigVal: bigint;
  try {
    if (fromBase === 10) {
      bigVal = BigInt(trimmed);
    } else if (fromBase === 16) {
      const cleanHex = trimmed.startsWith("0x") || trimmed.startsWith("0X") ? trimmed.slice(2) : trimmed;
      bigVal = BigInt(`0x${cleanHex}`);
    } else if (fromBase === 2) {
      const cleanBin = trimmed.startsWith("0b") || trimmed.startsWith("0B") ? trimmed.slice(2) : trimmed;
      bigVal = BigInt(`0b${cleanBin}`);
    } else if (fromBase === 8) {
      const cleanOct = trimmed.startsWith("0o") || trimmed.startsWith("0O") ? trimmed.slice(2) : trimmed;
      bigVal = BigInt(`0o${cleanOct}`);
    } else {
      // General radix parser for bases 2-36
      const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
      const validDigits = digits.slice(0, fromBase);
      let acc = BigInt(0);
      const baseBig = BigInt(fromBase);

      for (const ch of trimmed.toLowerCase()) {
        const val = validDigits.indexOf(ch);
        if (val === -1) {
          throw new Error(`Invalid digit '${ch}' for base ${fromBase}`);
        }
        acc = acc * baseBig + BigInt(val);
      }
      bigVal = acc;
    }
  } catch (err) {
    throw new Error(`Invalid number format for base ${fromBase}`);
  }

  const binary = bigVal.toString(2);
  const octal = bigVal.toString(8);
  const decimal = bigVal.toString(10);
  const hexadecimal = bigVal.toString(16).toUpperCase();

  // Custom base output
  let customBaseValue: string | undefined;
  if (customTargetBase >= 2 && customTargetBase <= 36) {
    customBaseValue = bigVal.toString(customTargetBase).toUpperCase();
  }

  // Bit grouping (8-bit bytes)
  const padLength = Math.ceil(binary.length / 8) * 8;
  const paddedBin = binary.padStart(Math.max(8, padLength), "0");
  const binChunks: string[] = [];
  for (let i = 0; i < paddedBin.length; i += 8) {
    binChunks.push(paddedBin.slice(i, i + 8));
  }
  const binaryGrouped = binChunks.join(" ");

  // Hex grouping (2-char bytes)
  const hexPadLength = Math.ceil(hexadecimal.length / 2) * 2;
  const paddedHex = hexadecimal.padStart(Math.max(2, hexPadLength), "0");
  const hexChunks: string[] = [];
  for (let i = 0; i < paddedHex.length; i += 2) {
    hexChunks.push(paddedHex.slice(i, i + 2));
  }
  const hexGrouped = hexChunks.join(" ");

  // ASCII character if single byte
  let asciiChar: string | undefined;
  if (bigVal >= BigInt(32) && bigVal <= BigInt(126)) {
    asciiChar = String.fromCharCode(Number(bigVal));
  }

  return {
    binary,
    octal,
    decimal,
    hexadecimal,
    customBaseValue,
    customBase: customTargetBase,
    bitCount: binary.length,
    byteCount: Math.ceil(binary.length / 8),
    asciiChar,
    binaryGrouped,
    hexGrouped,
  };
}
