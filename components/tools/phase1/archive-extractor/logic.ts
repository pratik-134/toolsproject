import { unzipSync, gunzipSync, strFromU8 } from "fflate";

export type ArchiveFormat = "zip" | "tar" | "gzip" | "unknown";

export interface ExtractedFile {
  name: string;
  path: string;
  size: number;
  data: Uint8Array;
  isDirectory: boolean;
  mimeType: string;
  isText: boolean;
  isImage: boolean;
}

export interface ArchiveMetadata {
  format: ArchiveFormat;
  totalFiles: number;
  totalDirectories: number;
  uncompressedSize: number;
  compressedSize: number;
  compressionRatio: number; // e.g. 45%
  files: ExtractedFile[];
}

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "json", "csv", "tsv", "xml", "html", "htm", "css", "js", "ts",
  "jsx", "tsx", "py", "sql", "sh", "yaml", "yml", "svg", "env", "ini", "toml"
]);

const IMAGE_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "avif"
]);

export function detectFormat(buffer: Uint8Array): ArchiveFormat {
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    // PK\x03\x04 or PK\x05\x06
    return "zip";
  }
  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return "gzip";
  }
  // Check TAR ustar signature at offset 257
  if (buffer.length >= 262) {
    const magic = strFromU8(buffer.subarray(257, 262));
    if (magic === "ustar") {
      return "tar";
    }
  }
  return "unknown";
}

export function getFileMimeType(filename: string): { mimeType: string; isText: boolean; isImage: boolean } {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (IMAGE_EXTENSIONS.has(ext)) {
    const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
    return { mimeType: mime, isText: ext === "svg", isImage: true };
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    let mime = "text/plain";
    if (ext === "json") mime = "application/json";
    else if (ext === "html" || ext === "htm") mime = "text/html";
    else if (ext === "css") mime = "text/css";
    else if (ext === "js") mime = "application/javascript";
    else if (ext === "xml") mime = "application/xml";
    else if (ext === "csv") mime = "text/csv";
    return { mimeType: mime, isText: true, isImage: false };
  }

  return { mimeType: "application/octet-stream", isText: false, isImage: false };
}

/**
 * Parses simple uncompressed TAR archive
 */
export function parseTar(buffer: Uint8Array): ExtractedFile[] {
  const files: ExtractedFile[] = [];
  let offset = 0;

  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);

    // Empty block indicates end of TAR
    let allZeros = true;
    for (let i = 0; i < 512; i++) {
      if (header[i] !== 0) {
        allZeros = false;
        break;
      }
    }
    if (allZeros) break;

    // File name: first 100 bytes
    let nameEnd = 0;
    while (nameEnd < 100 && header[nameEnd] !== 0) nameEnd++;
    const name = strFromU8(header.subarray(0, nameEnd)).trim();

    if (!name) {
      offset += 512;
      continue;
    }

    // Size: bytes 124..135 in octal string
    let sizeStr = "";
    for (let i = 124; i < 136; i++) {
      const c = header[i];
      if (c === undefined || c === 0 || c === 32) break; // null or space
      sizeStr += String.fromCharCode(c);
    }
    const size = parseInt(sizeStr.trim(), 8) || 0;

    // Typeflag: byte 156 ('5' for directory)
    const typeflag = String.fromCharCode(header[156] || 0);
    const isDirectory = typeflag === "5" || name.endsWith("/");

    offset += 512; // Move past header

    const fileData = buffer.subarray(offset, offset + size);
    // In TAR, data is padded to 512-byte boundary
    offset += Math.ceil(size / 512) * 512;

    const { mimeType, isText, isImage } = getFileMimeType(name);

    files.push({
      name: name.split("/").filter(Boolean).pop() || name,
      path: name,
      size,
      data: fileData,
      isDirectory,
      mimeType,
      isText,
      isImage,
    });
  }

  return files;
}

/**
 * Extracts any supported archive buffer (ZIP, TAR, GZ)
 */
export function extractArchive(rawBuffer: Uint8Array | ArrayBuffer): ArchiveMetadata {
  const buffer = rawBuffer instanceof Uint8Array ? rawBuffer : new Uint8Array(rawBuffer);
  let format = detectFormat(buffer);
  let extracted: ExtractedFile[] = [];

  if (format === "zip") {
    const unzipped = unzipSync(buffer);
    for (const [path, data] of Object.entries(unzipped)) {
      const isDirectory = path.endsWith("/");
      const name = path.split("/").filter(Boolean).pop() || path;
      const { mimeType, isText, isImage } = getFileMimeType(name);

      extracted.push({
        name,
        path,
        size: data.length,
        data,
        isDirectory,
        mimeType,
        isText,
        isImage,
      });
    }
  } else if (format === "tar") {
    extracted = parseTar(buffer);
  } else if (format === "gzip") {
    // Check if inner is TAR
    const decompressed = gunzipSync(buffer);
    if (detectFormat(decompressed) === "tar") {
      format = "tar";
      extracted = parseTar(decompressed);
    } else {
      // Single decompressed file
      extracted.push({
        name: "decompressed_file",
        path: "decompressed_file",
        size: decompressed.length,
        data: decompressed,
        isDirectory: false,
        mimeType: "application/octet-stream",
        isText: false,
        isImage: false,
      });
    }
  } else {
    // Fallback: Attempt standard unzip
    try {
      const unzipped = unzipSync(buffer);
      format = "zip";
      for (const [path, data] of Object.entries(unzipped)) {
        const isDirectory = path.endsWith("/");
        const name = path.split("/").filter(Boolean).pop() || path;
        const { mimeType, isText, isImage } = getFileMimeType(name);
        extracted.push({
          name,
          path,
          size: data.length,
          data,
          isDirectory,
          mimeType,
          isText,
          isImage,
        });
      }
    } catch {
      format = "unknown";
    }
  }

  // Sort files: directories first, then alphabetically
  extracted.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.path.localeCompare(b.path);
  });

  const totalFiles = extracted.filter((f) => !f.isDirectory).length;
  const totalDirectories = extracted.filter((f) => f.isDirectory).length;
  const uncompressedSize = extracted.reduce((acc, f) => acc + (f.isDirectory ? 0 : f.size), 0);
  const compressedSize = buffer.length;
  const compressionRatio =
    uncompressedSize > 0
      ? Math.round(((uncompressedSize - compressedSize) / uncompressedSize) * 100)
      : 0;

  return {
    format,
    totalFiles,
    totalDirectories,
    uncompressedSize,
    compressedSize,
    compressionRatio,
    files: extracted,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function readTextContent(file: ExtractedFile): string {
  try {
    return strFromU8(file.data);
  } catch {
    return "[Binary data cannot be displayed as text]";
  }
}
