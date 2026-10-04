export interface PastePayload {
  title: string;
  content: string;
  language: string;
  createdAt: number;
}

export interface EncryptedPasteVault {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
  key?: string;       // Base64 (if auto-generated)
  requiresPassphrase: boolean;
  createdAt: number;
}

export const SUPPORTED_LANGUAGES = [
  { id: "plaintext", label: "Plain Text", ext: "txt" },
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "typescript", label: "TypeScript", ext: "ts" },
  { id: "python", label: "Python", ext: "py" },
  { id: "json", label: "JSON", ext: "json" },
  { id: "html", label: "HTML", ext: "html" },
  { id: "css", label: "CSS", ext: "css" },
  { id: "markdown", label: "Markdown", ext: "md" },
  { id: "sql", label: "SQL", ext: "sql" },
  { id: "bash", label: "Shell / Bash", ext: "sh" },
  { id: "yaml", label: "YAML", ext: "yaml" },
] as const;

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
 * Encrypt paste content and metadata using AES-GCM-256.
 */
export async function encryptPaste(
  paste: { title?: string; content: string; language?: string },
  options: { passphrase?: string } = {}
): Promise<EncryptedPasteVault> {
  if (!paste.content || paste.content.trim().length === 0) {
    throw new Error("Paste content cannot be empty");
  }

  const payload: PastePayload = {
    title: (paste.title || "").trim() || "Untitled Paste",
    content: paste.content,
    language: paste.language || "plaintext",
    createdAt: Date.now(),
  };

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(payload));

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
    encodedData
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    key: rawKeyBase64,
    requiresPassphrase: !!(options.passphrase && options.passphrase.trim().length > 0),
    createdAt: payload.createdAt,
  };
}

/**
 * Decrypt paste vault back to PastePayload.
 */
export async function decryptPaste(
  vault: EncryptedPasteVault,
  options: { passphrase?: string; keyOverride?: string } = {}
): Promise<PastePayload> {
  const iv = base64ToBuffer(vault.iv);
  const salt = base64ToBuffer(vault.salt);
  const ciphertext = base64ToBuffer(vault.ciphertext);

  let cryptoKey: CryptoKey;

  if (vault.requiresPassphrase) {
    if (!options.passphrase) {
      throw new Error("This paste requires a passphrase to decrypt");
    }
    cryptoKey = await deriveKeyFromPassphrase(options.passphrase, salt, ["decrypt"]);
  } else {
    const rawKeyBase64 = options.keyOverride || vault.key;
    if (!rawKeyBase64) {
      throw new Error("Decryption key missing from paste URL");
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
    const rawJson = decoder.decode(decryptedBuffer);
    const parsed = JSON.parse(rawJson) as PastePayload;

    return {
      title: parsed.title || "Untitled Paste",
      content: parsed.content || "",
      language: parsed.language || "plaintext",
      createdAt: parsed.createdAt || vault.createdAt,
    };
  } catch {
    throw new Error("Decryption failed: invalid passphrase or corrupted paste data");
  }
}

/**
 * Serializes an EncryptedPasteVault into URL hash.
 */
export function serializePasteToHash(vault: EncryptedPasteVault): string {
  const payload = {
    c: vault.ciphertext,
    i: vault.iv,
    s: vault.salt,
    k: vault.key || "",
    p: vault.requiresPassphrase ? 1 : 0,
    t: vault.createdAt,
  };
  return `#paste=${encodeURIComponent(btoa(JSON.stringify(payload)))}`;
}

/**
 * Parses an EncryptedPasteVault from URL hash.
 */
export function parsePasteFromHash(hashString: string): EncryptedPasteVault | null {
  if (!hashString || !hashString.includes("paste=")) {
    return null;
  }

  try {
    const cleanHash = hashString.startsWith("#") ? hashString.slice(1) : hashString;
    const match = cleanHash.match(/paste=([^&]+)/);
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
    };
  } catch {
    return null;
  }
}
