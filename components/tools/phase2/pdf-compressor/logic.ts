import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface CompressOptions {
  stripMetadata?: boolean;
  useObjectStreams?: boolean;
}

export interface CompressResult {
  data: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savingsBytes: number;
  savingsPercent: number;
}

/**
 * Creates an in-memory sample PDF loaded with verbose metadata and multiple pages
 * to demonstrate compression metrics.
 */
export async function createSampleCompressPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  doc.setTitle("Mindkit Uncompressed Document Example with Heavy Metadata");
  doc.setAuthor("Mindkit Enterprise Authoring Suite - Department of Digital Systems");
  doc.setSubject("Client-Side In-Browser PDF Compression Benchmarks and Analysis");
  doc.setKeywords([
    "mindkit",
    "pdf",
    "compression",
    "privacy",
    "client-side",
    "benchmark",
    "stream",
    "objects",
  ]);
  doc.setProducer("Mindkit Engine v1.0.0");
  doc.setCreator("Mindkit Test Document Generator");

  for (let i = 1; i <= 3; i++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawText(`Compression Demo Page ${i}`, {
      x: 50,
      y: height - 100,
      size: 24,
      font,
      color: rgb(0.15, 0.25, 0.55),
    });

    page.drawText(
      `This document contains object streams and metadata that can be stripped and packed client-side.`,
      {
        x: 50,
        y: height - 140,
        size: 13,
        font,
        color: rgb(0.35, 0.35, 0.35),
      }
    );
  }

  // Save without object streams first so it's uncompressed
  return await doc.save({ useObjectStreams: false });
}

/**
 * Compresses a PDF buffer using object stream packing and metadata stripping.
 */
export async function compressPdf(
  pdfBuffer: Uint8Array,
  options: CompressOptions = { stripMetadata: true, useObjectStreams: true }
): Promise<CompressResult> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }

  const originalSize = pdfBuffer.length;
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  if (options.stripMetadata) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
  }

  const compressedData = await doc.save({
    useObjectStreams: options.useObjectStreams ?? true,
    addDefaultPage: false,
  });

  const compressedSize = compressedData.length;
  const savingsBytes = Math.max(0, originalSize - compressedSize);
  const savingsPercent =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 1000) / 10)
      : 0;

  return {
    data: compressedData,
    originalSize,
    compressedSize,
    savingsBytes,
    savingsPercent,
  };
}
