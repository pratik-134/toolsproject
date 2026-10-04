import {
  encryptLink,
  decryptLink,
  serializeLinkToHash,
  parseLinkFromHash,
  isLinkExpired,
  validateUrl,
} from "./logic";

export async function runTests(): Promise<boolean> {
  const targetUrl = "https://internal.acme-corp.com/dashboards/q4-financials?token=xyz998";
  const password = "TeamPassword442!";
  const hint = "Project code name from sprint review";
  const note = "Confidential Q4 summary for leadership eyes only.";

  // Test 1: URL validator
  if (!validateUrl("https://example.com") || !validateUrl("http://localhost:3000/demo")) {
    throw new Error("Valid URLs failed validation");
  }
  if (validateUrl("not-a-url") || validateUrl("ftp://file.com") || validateUrl("")) {
    throw new Error("Invalid URLs passed validation");
  }

  // Test 2: Encryption roundtrip with note and hint
  const vault = await encryptLink(targetUrl, password, { hint, note, ttlMinutes: 120 });
  if (!vault.ciphertext || !vault.iv || !vault.salt || vault.hint !== hint) {
    throw new Error("Vault missing required encrypted or hint fields");
  }

  const decrypted = await decryptLink(vault, password);
  if (decrypted.url !== targetUrl || decrypted.note !== note) {
    throw new Error("Decrypted payload does not match original target URL and note");
  }

  // Test 3: Incorrect password rejection
  let wrongPassFailed = false;
  try {
    await decryptLink(vault, "IncorrectPass");
  } catch {
    wrongPassFailed = true;
  }
  if (!wrongPassFailed) {
    throw new Error("Decryption with incorrect password should throw an error");
  }

  // Test 4: Tampered ciphertext integrity rejection
  const tamperedVault = { ...vault, ciphertext: vault.ciphertext.slice(0, -6) + "ZZZZZZ" };
  let tamperedFailed = false;
  try {
    await decryptLink(tamperedVault, password);
  } catch {
    tamperedFailed = true;
  }
  if (!tamperedFailed) {
    throw new Error("Decryption of tampered ciphertext should throw integrity error");
  }

  // Test 5: Hash serialization & parsing roundtrip
  const hash = serializeLinkToHash(vault);
  if (!hash.startsWith("#link=")) {
    throw new Error(`Invalid hash prefix: ${hash}`);
  }

  const parsed = parseLinkFromHash(hash);
  if (!parsed || parsed.ciphertext !== vault.ciphertext || parsed.hint !== vault.hint) {
    throw new Error("Parsed link vault does not match original vault");
  }

  // Test 6: Expiration calculation
  const now = Date.now();
  const freshVault = { ...vault, createdAt: now - 1000 * 60 * 30, ttlMinutes: 60 }; // 30 mins old, 60 min TTL
  if (isLinkExpired(freshVault, now)) {
    throw new Error("Fresh link should not be expired");
  }

  const expiredVault = { ...vault, createdAt: now - 1000 * 60 * 90, ttlMinutes: 60 }; // 90 mins old, 60 min TTL
  if (!isLinkExpired(expiredVault, now)) {
    throw new Error("Link should be marked as expired when TTL passed");
  }

  // Test 7: Validation error on invalid URL input
  let invalidUrlFailed = false;
  try {
    await encryptLink("invalid-url-string", "pwd");
  } catch {
    invalidUrlFailed = true;
  }
  if (!invalidUrlFailed) {
    throw new Error("Encrypting invalid URL should throw error");
  }

  return true;
}
