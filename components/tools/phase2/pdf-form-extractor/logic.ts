import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFDropdown,
  PDFRadioGroup,
  PDFOptionList,
  rgb,
  StandardFonts,
} from "pdf-lib";

export interface FormFieldInfo {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "radio" | "option-list" | "unknown";
  value: string;
  isReadOnly: boolean;
}

/**
 * Creates an in-memory sample fillable PDF with various field types
 * for testing and demonstration presets.
 */
export async function createSampleFormExtractionPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawText("Employee Intake Form", {
    x: 50,
    y: height - 80,
    size: 22,
    font,
    color: rgb(0.1, 0.25, 0.55),
  });

  const form = doc.getForm();

  // 1. Text field
  const nameField = form.createTextField("employee.fullName");
  nameField.setText("Jordan Lee");
  nameField.addToPage(page, { x: 50, y: height - 140, width: 250, height: 22 });

  // 2. Department dropdown
  const deptDropdown = form.createDropdown("employee.department");
  deptDropdown.setOptions(["Engineering", "Product", "Operations", "Finance"]);
  deptDropdown.select("Engineering");
  deptDropdown.addToPage(page, { x: 50, y: height - 190, width: 200, height: 22 });

  // 3. Remote Checkbox
  const remoteCheck = form.createCheckBox("employee.remoteEligible");
  remoteCheck.check();
  remoteCheck.addToPage(page, { x: 50, y: height - 240, width: 18, height: 18 });

  return await doc.save();
}

/**
 * Inspects a PDF and extracts all interactive AcroForm field keys, types, and values.
 */
export async function extractFormFields(pdfBuffer: Uint8Array): Promise<FormFieldInfo[]> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  const results: FormFieldInfo[] = [];

  for (const field of fields) {
    const name = field.getName();
    const isReadOnly = field.isReadOnly();
    let type: FormFieldInfo["type"] = "unknown";
    let value = "";

    if (field instanceof PDFTextField) {
      type = "text";
      value = field.getText() ?? "";
    } else if (field instanceof PDFCheckBox) {
      type = "checkbox";
      value = field.isChecked() ? "true" : "false";
    } else if (field instanceof PDFDropdown) {
      type = "dropdown";
      value = field.getSelected().join(", ");
    } else if (field instanceof PDFRadioGroup) {
      type = "radio";
      value = field.getSelected() ?? "";
    } else if (field instanceof PDFOptionList) {
      type = "option-list";
      value = field.getSelected().join(", ");
    }

    results.push({
      name,
      type,
      value,
      isReadOnly,
    });
  }

  return results;
}

/**
 * Formats extracted form fields into clean CSV string.
 */
export function formFieldsToCsv(fields: FormFieldInfo[]): string {
  const header = ["Field Name", "Type", "Value", "Read Only"];
  const rows = fields.map((f) => [
    `"${f.name.replace(/"/g, '""')}"`,
    `"${f.type}"`,
    `"${f.value.replace(/"/g, '""')}"`,
    f.isReadOnly ? "YES" : "NO",
  ]);

  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
