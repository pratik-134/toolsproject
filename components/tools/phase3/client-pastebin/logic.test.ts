import {
  encryptPaste,
  decryptPaste,
  serializePasteToHash,
  parsePasteFromHash,
  SUPPORTED_LANGUAGES,
} from "./logic";

export async function runTests(): Promise<boolean> {
  const samplePayload = {
    title: "Database Migration Script",
    content: "CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE);",
    language: "sql",
  };

  // Test 1: Supported languages check
  if (!SUPPORTED_LANGUAGES || SUPPORTED_LANGUAGES.length < 5) {
    throw new Error("Supported languages should define at least 5 common languages");
  }

  // Test 2: Auto-key encryption roundtrip
  const autoVault = await encryptPaste(samplePayload);
  if (!autoVault.ciphertext || !autoVault.iv || !autoVault.key) {
    throw new Error("Auto-key paste encryption failed to generate expected fields");
  }

  const decryptedAuto = await decryptPaste(autoVault);
  if (
    decryptedAuto.title !== samplePayload.title ||
    decryptedAuto.content !== samplePayload.content ||
    decryptedAuto.language !== samplePayload.language
  ) {
    throw new Error("Decrypted paste does not match original payload");
  }

  // Test 3: Passphrase-protected encryption roundtrip
  const passphrase = "VaultSecretPhrase2026";
  const passVault = await encryptPaste(samplePayload, { passphrase });
  if (!passVault.requiresPassphrase || passVault.key) {
    throw new Error("Passphrase vault should require passphrase and omit auto-key");
  }

  const decryptedPass = await decryptPaste(passVault, { passphrase });
  if (decryptedPass.content !== samplePayload.content) {
    throw new Error("Passphrase decrypted paste content mismatch");
  }

  // Test 4: Wrong passphrase rejection
  let wrongPassFailed = false;
  try {
    await decryptPaste(passVault, { passphrase: "WrongPassphrase123" });
  } catch {
    wrongPassFailed = true;
  }
  if (!wrongPassFailed) {
    throw new Error("Decrypting with invalid passphrase should throw an error");
  }

  // Test 5: Hash serialization and roundtrip
  const hash = serializePasteToHash(autoVault);
  if (!hash.startsWith("#paste=")) {
    throw new Error(`Unexpected hash format: ${hash}`);
  }

  const parsedVault = parsePasteFromHash(hash);
  if (!parsedVault || parsedVault.ciphertext !== autoVault.ciphertext || parsedVault.key !== autoVault.key) {
    throw new Error("Parsed paste vault does not match original vault");
  }

  // Test 6: Empty content rejection
  let emptyRejected = false;
  try {
    await encryptPaste({ title: "Empty", content: "   " });
  } catch {
    emptyRejected = true;
  }
  if (!emptyRejected) {
    throw new Error("Encrypting empty content should throw error");
  }

  return true;
}
