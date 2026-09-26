import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface FlattenResult {
  data: Uint8Array;
  fieldCount: number;
  pageCount: number;
}

/**
 * Creates an in-memory sample PDF containing interactive form fields
 * to test and demonstrate form flattening.
 */
export async function createSampleFillablePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawText("Client Non-Disclosure Agreement (NDA)", {
    x: 50,
    y: height - 80,
    size: 20,
    font,
    color: rgb(0.1, 0.2, 0.5),
  });

  page.drawText("Full Legal Name:", {
    x: 50,
    y: height - 140,
    size: 12,
    font,
  });

  page.drawText("Company Organization:", {
    x: 50,
    y: height - 200,
    size: 12,
    font,
  });

  page.drawText("I agree to all confidentiality terms and conditions:", {
    x: 80,
    y: height - 250,
    size: 11,
    font,
  });

  // Create interactive AcroForm fields
  const form = doc.getForm();

  const nameField = form.createTextField("client.legalName");
  nameField.setText("Alex Vance");
  nameField.addToPage(page, { x: 50, y: height - 170, width: 300, height: 24 });

  const companyField = form.createTextField("client.company");
  companyField.setText("Black Mesa Technologies");
  companyField.addToPage(page, { x: 50, y: height - 230, width: 300, height: 24 });

  const agreeCheck = form.createCheckBox("client.agreement");
  agreeCheck.check();
  agreeCheck.addToPage(page, { x: 50, y: height - 255, width: 18, height: 18 });

  return await doc.save();
}

/**
 * Counts the number of interactive AcroForm fields in a PDF document.
 */
export async function countFormFields(pdfBuffer: Uint8Array): Promise<number> {
  if (!pdfBuffer || pdfBuffer.length === 0) return 0;
  try {
    const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const form = doc.getForm();
    return form.getFields().length;
  } catch {
    return 0;
  }
}

/**
 * Flattens all interactive form fields and annotations into static printable vector page elements.
 */
export async function flattenPdf(pdfBuffer: Uint8Array): Promise<FlattenResult> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  const fieldCount = fields.length;
  const pageCount = doc.getPageCount();

  if (fieldCount > 0) {
    form.flatten();
  }

  const data = await doc.save();

  return {
    data,
    fieldCount,
    pageCount,
  };
}
