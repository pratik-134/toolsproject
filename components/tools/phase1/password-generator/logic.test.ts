import { generatePassword, generatePassphrase } from "./logic";

export function runTests(): boolean {
  // Test 1: Generate password length 20 with all characters
  const res = generatePassword({
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    avoidAmbiguous: true,
  });

  if (res.password.length !== 20) throw new Error(`Expected length 20, got ${res.password.length}`);
  if (res.entropyBits < 80) throw new Error(`Expected high entropy, got ${res.entropyBits}`);

  // Test 2: Generate passphrase with 4 words and dash separator
  const pass = generatePassphrase({
    wordsCount: 4,
    separator: "-",
    capitalize: true,
    includeNumber: true,
  });

  const parts = pass.passphrase.split("-");
  if (parts.length !== 5) throw new Error(`Expected 5 parts (4 words + number), got ${parts.length}`);

  return true;
}
