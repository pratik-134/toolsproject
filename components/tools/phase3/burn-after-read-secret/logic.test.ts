import {
  encryptSecret,
  decryptSecret,
  serializeVaultToHash,
  parseVaultFromHash,
  isSecretExpired,
} from "./logic";

export async function runTests(): Promise<boolean> {
  const sampleSecret = "CONFIDENTIAL_API_KEY_SEC_9918237";

  // Test 1: Auto-generated key roundtrip
  const autoVault = await encryptSecret(sampleSecret);
  if (!autoVault.ciphertext || !autoVault.iv || !autoVault.key) {
    throw new Error("Failed to produce valid encrypted vault with auto-key");
  }

  const decryptedAuto = await decryptSecret(autoVault);
  if (decryptedAuto !== sampleSecret) {
    throw new Error(`Expected '${sampleSecret}', got '${decryptedAuto}'`);
  }

  // Test 2: Passphrase-derived key roundtrip
  const passVault = await encryptSecret(sampleSecret, { passphrase: "StrongMasterPassword!2026" });
  if (!passVault.requiresPassphrase) {
    throw new Error("Vault should require passphrase");
  }

  const decryptedPass = await decryptSecret(passVault, { passphrase: "StrongMasterPassword!2026" });
  if (decryptedPass !== sampleSecret) {
    throw new Error(`Expected '${sampleSecret}', got '${decryptedPass}'`);
  }

  // Test 3: Incorrect passphrase rejection
  let failedAsExpected = false;
  try {
    await decryptSecret(passVault, { passphrase: "WrongPassword" });
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Decryption should have thrown error on wrong password");
  }

  // Test 4: Tampered ciphertext integrity rejection (AES-GCM auth tag verification)
  const tamperedVault = { ...autoVault, ciphertext: autoVault.ciphertext.slice(0, -4) + "AAAA" };
  let tamperedFailed = false;
  try {
    await decryptSecret(tamperedVault);
  } catch {
    tamperedFailed = true;
  }
  if (!tamperedFailed) {
    throw new Error("Decryption should fail on tampered ciphertext");
  }

  // Test 5: URL Hash Serialization & Deserialization
  const hashString = serializeVaultToHash(autoVault);
  if (!hashString.startsWith("#data=")) {
    throw new Error(`Invalid hash prefix: ${hashString}`);
  }

  const parsedVault = parseVaultFromHash(hashString);
  if (!parsedVault || parsedVault.ciphertext !== autoVault.ciphertext || parsedVault.key !== autoVault.key) {
    throw new Error("Hash parsing failed to reconstruct vault");
  }

  // Test 6: Expiration calculation
  const now = Date.now();
  const freshVault = { ...autoVault, createdAt: now - 1000 * 60 * 10, ttlMinutes: 30 }; // 10 mins old, 30 min ttl
  if (isSecretExpired(freshVault, now)) {
    throw new Error("Secret should not be expired within TTL");
  }

  const expiredVault = { ...autoVault, createdAt: now - 1000 * 60 * 60, ttlMinutes: 30 }; // 60 mins old, 30 min ttl
  if (!isSecretExpired(expiredVault, now)) {
    throw new Error("Secret should be expired after TTL exceeded");
  }

  // Test 7: Empty secret rejection
  let emptyRejected = false;
  try {
    await encryptSecret("");
  } catch {
    emptyRejected = true;
  }
  if (!emptyRejected) {
    throw new Error("Encrypting empty text should throw error");
  }

  return true;
}
