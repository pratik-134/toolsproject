export interface EncryptedVault {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
  key?: string;       // Base64 (if auto-generated)
  requiresPassphrase: boolean;
  createdAt: number;
  ttlMinutes: number; // 0 for burn immediately on first read
}

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM Key from Passphrase using PBKDF2
async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    usage
  );
}

/**
 * Encrypt a secret message using AES-GCM-256.
 * If passphrase is provided, derives key with PBKDF2.
 * If not, generates a random 256-bit key returned in the vault for the URL hash.
 */
export async function encryptSecret(
  plaintext: string,
  options: {
    passphrase?: string;
    ttlMinutes?: number;
  } = {}
): Promise<EncryptedVault> {
  if (!plaintext) {
    throw new Error("Secret text cannot be empty");
  }

  const encoder = new TextEncoder();
  const encodedPlaintext = encoder.encode(plaintext);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  let cryptoKey: CryptoKey;
  let rawKeyBase64: string | undefined;

  if (options.passphrase && options.passphrase.trim().length > 0) {
    cryptoKey = await deriveKeyFromPassphrase(options.passphrase.trim(), salt, ["encrypt"]);
  } else {
    cryptoKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exportedRaw = await crypto.subtle.exportKey("raw", cryptoKey);
    rawKeyBase64 = bufferToBase64(exportedRaw);
  }

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
    cryptoKey,
    encodedPlaintext
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    key: rawKeyBase64,
    requiresPassphrase: !!(options.passphrase && options.passphrase.trim().length > 0),
    createdAt: Date.now(),
    ttlMinutes: options.ttlMinutes ?? 0,
  };
}

/**
 * Decrypt a secret message using AES-GCM-256.
 */
export async function decryptSecret(
  vault: EncryptedVault,
  options: {
    passphrase?: string;
    keyOverride?: string;
  } = {}
): Promise<string> {
  const iv = base64ToBuffer(vault.iv);
  const salt = base64ToBuffer(vault.salt);
  const ciphertext = base64ToBuffer(vault.ciphertext);

  let cryptoKey: CryptoKey;

  if (vault.requiresPassphrase) {
    if (!options.passphrase) {
      throw new Error("This secret requires a password to decrypt");
    }
    cryptoKey = await deriveKeyFromPassphrase(options.passphrase, salt, ["decrypt"]);
  } else {
    const rawKeyBase64 = options.keyOverride || vault.key;
    if (!rawKeyBase64) {
      throw new Error("Decryption key missing from secret payload");
    }
    const rawKey = base64ToBuffer(rawKeyBase64);
    cryptoKey = await crypto.subtle.importKey(
      "raw",
      rawKey as unknown as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
  }

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
      cryptoKey,
      ciphertext as unknown as ArrayBuffer
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error("Decryption failed: invalid password or corrupted secret data");
  }
}

/**
 * Serializes an EncryptedVault into a URL Hash string.
 */
export function serializeVaultToHash(vault: EncryptedVault): string {
  const payload = {
    c: vault.ciphertext,
    i: vault.iv,
    s: vault.salt,
    k: vault.key || "",
    p: vault.requiresPassphrase ? 1 : 0,
    t: vault.createdAt,
    m: vault.ttlMinutes,
  };
  return `#data=${encodeURIComponent(btoa(JSON.stringify(payload)))}`;
}

/**
 * Parses an EncryptedVault from a URL Hash string.
 */
export function parseVaultFromHash(hashString: string): EncryptedVault | null {
  if (!hashString || !hashString.includes("data=")) {
    return null;
  }

  try {
    const cleanHash = hashString.startsWith("#") ? hashString.slice(1) : hashString;
    const match = cleanHash.match(/data=([^&]+)/);
    if (!match || !match[1]) return null;

    const rawJson = atob(decodeURIComponent(match[1]));
    const parsed = JSON.parse(rawJson);

    if (!parsed.c || !parsed.i || !parsed.s) {
      return null;
    }

    return {
      ciphertext: parsed.c,
      iv: parsed.i,
      salt: parsed.s,
      key: parsed.k || undefined,
      requiresPassphrase: parsed.p === 1,
      createdAt: parsed.t || Date.now(),
      ttlMinutes: parsed.m || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Check if the secret has expired based on TTL.
 */
export function isSecretExpired(vault: EncryptedVault, currentEpoch: number = Date.now()): boolean {
  if (vault.ttlMinutes <= 0) return false; // 0 means burn on first view
  const expiryTime = vault.createdAt + vault.ttlMinutes * 60 * 1000;
  return currentEpoch > expiryTime;
}
