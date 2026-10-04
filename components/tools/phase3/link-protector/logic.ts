export interface ProtectedLinkVault {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
  hint?: string;      // Plaintext optional hint
  createdAt: number;
  ttlMinutes: number; // 0 for no expiration
}

export interface ProtectedLinkPayload {
  url: string;
  note?: string;
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

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
 * Encrypt target URL and optional note with AES-GCM-256.
 */
export async function encryptLink(
  targetUrl: string,
  passphrase: string,
  options: {
    hint?: string;
    note?: string;
    ttlMinutes?: number;
  } = {}
): Promise<ProtectedLinkVault> {
  const trimmedUrl = targetUrl.trim();
  if (!validateUrl(trimmedUrl)) {
    throw new Error("Invalid destination URL. Must start with http:// or https://");
  }

  const trimmedPass = passphrase.trim();
  if (!trimmedPass || trimmedPass.length < 3) {
    throw new Error("Password must be at least 3 characters long");
  }

  const payload: ProtectedLinkPayload = {
    url: trimmedUrl,
    note: (options.note || "").trim() || undefined,
  };

  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const cryptoKey = await deriveKeyFromPassphrase(trimmedPass, salt, ["encrypt"]);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
    cryptoKey,
    encodedPayload
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    hint: (options.hint || "").trim() || undefined,
    createdAt: Date.now(),
    ttlMinutes: options.ttlMinutes ?? 0,
  };
}

/**
 * Decrypt target URL and note from vault using passphrase.
 */
export async function decryptLink(
  vault: ProtectedLinkVault,
  passphrase: string
): Promise<ProtectedLinkPayload> {
  const trimmedPass = passphrase.trim();
  if (!trimmedPass) {
    throw new Error("Password is required to unlock this link");
  }

  const iv = base64ToBuffer(vault.iv);
  const salt = base64ToBuffer(vault.salt);
  const ciphertext = base64ToBuffer(vault.ciphertext);

  const cryptoKey = await deriveKeyFromPassphrase(trimmedPass, salt, ["decrypt"]);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
      cryptoKey,
      ciphertext as unknown as ArrayBuffer
    );
    const decoder = new TextDecoder();
    const rawJson = decoder.decode(decryptedBuffer);
    const parsed = JSON.parse(rawJson) as ProtectedLinkPayload;

    if (!parsed.url || !validateUrl(parsed.url)) {
      throw new Error("Decrypted content does not contain a valid URL");
    }

    return parsed;
  } catch {
    throw new Error("Incorrect password or corrupted link data");
  }
}

/**
 * Serializes a ProtectedLinkVault into URL hash string.
 */
export function serializeLinkToHash(vault: ProtectedLinkVault): string {
  const payload = {
    c: vault.ciphertext,
    i: vault.iv,
    s: vault.salt,
    h: vault.hint || "",
    t: vault.createdAt,
    m: vault.ttlMinutes,
  };
  return `#link=${encodeURIComponent(btoa(JSON.stringify(payload)))}`;
}

/**
 * Parses a ProtectedLinkVault from URL hash string.
 */
export function parseLinkFromHash(hashString: string): ProtectedLinkVault | null {
  if (!hashString || !hashString.includes("link=")) {
    return null;
  }

  try {
    const cleanHash = hashString.startsWith("#") ? hashString.slice(1) : hashString;
    const match = cleanHash.match(/link=([^&]+)/);
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
      hint: parsed.h || undefined,
      createdAt: parsed.t || Date.now(),
      ttlMinutes: parsed.m || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Check if the protected link has expired based on TTL.
 */
export function isLinkExpired(vault: ProtectedLinkVault, currentEpoch: number = Date.now()): boolean {
  if (vault.ttlMinutes <= 0) return false;
  const expiryTime = vault.createdAt + vault.ttlMinutes * 60 * 1000;
  return currentEpoch > expiryTime;
}
