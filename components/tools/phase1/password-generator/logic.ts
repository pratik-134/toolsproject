export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  avoidAmbiguous: boolean;
}

export interface PassphraseOptions {
  wordsCount: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0O1lI";

const WORD_LIST = [
  "falcon", "orbit", "prism", "galaxy", "summit", "canyon", "aurora", "beacon",
  "cipher", "anchor", "glacier", "zenith", "harbor", "nebula", "meteor", "quartz",
  "shadow", "timber", "vortex", "cascade", "eclipse", "horizon", "island", "journey",
  "kernel", "legend", "matrix", "nature", "oasis", "pioneer", "quasar", "radius",
  "safari", "trident", "uranium", "velvet", "whisper", "crystal", "delta", "echo",
];

function getRandomInt(max: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const val = array[0];
    if (val !== undefined) {
      return val % max;
    }
  }
  return Math.floor(Math.random() * max);
}

export function generatePassword(options: PasswordOptions): { password: string; entropyBits: number } {
  let pool = "";
  if (options.includeUppercase) pool += UPPER;
  if (options.includeLowercase) pool += LOWER;
  if (options.includeNumbers) pool += NUMBERS;
  if (options.includeSymbols) pool += SYMBOLS;

  if (options.avoidAmbiguous) {
    pool = pool.split("").filter((char) => !AMBIGUOUS.includes(char)).join("");
  }

  if (!pool) {
    pool = LOWER;
  }

  const length = Math.max(6, Math.min(128, options.length));
  let result = "";

  for (let i = 0; i < length; i++) {
    const idx = getRandomInt(pool.length);
    result += pool.charAt(idx);
  }

  const entropyBits = Math.round(length * Math.log2(pool.length));

  return { password: result, entropyBits };
}

export function generatePassphrase(options: PassphraseOptions): { passphrase: string; entropyBits: number } {
  const wordsCount = Math.max(3, Math.min(12, options.wordsCount));
  const chosenWords: string[] = [];

  for (let i = 0; i < wordsCount; i++) {
    const idx = getRandomInt(WORD_LIST.length);
    const word = WORD_LIST[idx] || "shield";
    chosenWords.push(options.capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  }

  let result = chosenWords.join(options.separator);
  if (options.includeNumber) {
    result += `${options.separator}${getRandomInt(99) + 1}`;
  }

  const entropyBits = Math.round(wordsCount * Math.log2(WORD_LIST.length) + (options.includeNumber ? 7 : 0));

  return { passphrase: result, entropyBits };
}
