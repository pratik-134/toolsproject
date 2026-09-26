import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface NewFieldDef {
  id: string;
  name: string;
  type: "text" | "checkbox" | "dropdown";
  pageIndex: number; // 0-indexed
  x: number;
  y: number;
  width: number;
  height: number;
  defaultValue?: string;
  options?: string[]; // For dropdown
}

/**
 * Creates an in-memory blank/template PDF suitable for adding interactive form elements.
 */
export async function createBlankPdfForFormBuilder(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawText("Standard Registration & Verification Document", {
    x: 50,
    y: height - 80,
    size: 20,
    font,
    color: rgb(0.12, 0.25, 0.55),
  });

  page.drawText(
    "Use the controls below to insert interactive AcroForm fields onto this page.",
    {
      x: 50,
      y: height - 110,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    }
  );

  return await doc.save();
}

/**
 * Adds defined interactive AcroForm fields to an existing PDF document.
 */
export async function addFormFieldsToPdf(
  pdfBuffer: Uint8Array,
  fields: NewFieldDef[]
): Promise<Uint8Array> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }
  if (!fields || fields.length === 0) {
    throw new Error("At least one form field definition is required.");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const pageCount = doc.getPageCount();

  for (const def of fields) {
    const pageIdx = Math.max(0, Math.min(pageCount - 1, def.pageIndex));
    const page = doc.getPage(pageIdx);

    if (def.type === "text") {
      const tf = form.createTextField(def.name);
      if (def.defaultValue) {
        tf.setText(def.defaultValue);
      }
      tf.addToPage(page, {
        x: def.x,
        y: def.y,
        width: def.width,
        height: def.height,
      });
    } else if (def.type === "checkbox") {
      const cb = form.createCheckBox(def.name);
      if (def.defaultValue === "true" || def.defaultValue === "checked") {
        cb.check();
      }
      cb.addToPage(page, {
        x: def.x,
        y: def.y,
        width: def.width,
        height: def.height,
      });
    } else if (def.type === "dropdown") {
      const dd = form.createDropdown(def.name);
      const opts = def.options && def.options.length > 0 ? def.options : ["Option 1", "Option 2"];
      dd.setOptions(opts);
      if (def.defaultValue && opts.includes(def.defaultValue)) {
        dd.select(def.defaultValue);
      } else if (opts[0]) {
        dd.select(opts[0]);
      }
      dd.addToPage(page, {
        x: def.x,
        y: def.y,
        width: def.width,
        height: def.height,
      });
    }
  }

  return await doc.save();
}
