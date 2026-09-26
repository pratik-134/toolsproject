import {
  createBlankPdfForFormBuilder,
  addFormFieldsToPdf,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export async function runTests(): Promise<boolean> {
  // Test 1: Create blank doc and add fields
  const blank = await createBlankPdfForFormBuilder();

  const generated = await addFormFieldsToPdf(blank, [
    {
      id: "f1",
      name: "applicant_name",
      type: "text",
      pageIndex: 0,
      x: 50,
      y: 650,
      width: 200,
      height: 24,
      defaultValue: "Jane Doe",
    },
    {
      id: "f2",
      name: "agreement_terms",
      type: "checkbox",
      pageIndex: 0,
      x: 50,
      y: 600,
      width: 18,
      height: 18,
      defaultValue: "checked",
    },
    {
      id: "f3",
      name: "country_dropdown",
      type: "dropdown",
      pageIndex: 0,
      x: 50,
      y: 550,
      width: 150,
      height: 24,
      options: ["United States", "Canada", "United Kingdom"],
      defaultValue: "Canada",
    },
  ]);

  if (!generated || generated.length === 0) {
    throw new Error("Generated PDF with form fields is empty.");
  }

  const doc = await PDFDocument.load(generated);
  const form = doc.getForm();
  const fields = form.getFields();

  if (fields.length !== 3) {
    throw new Error(`Expected 3 fields in form, got ${fields.length}`);
  }

  const nameField = form.getTextField("applicant_name");
  if (nameField.getText() !== "Jane Doe") {
    throw new Error(`Expected text field value Jane Doe, got ${nameField.getText()}`);
  }

  const checkField = form.getCheckBox("agreement_terms");
  if (!checkField.isChecked()) {
    throw new Error("Expected checkbox to be checked.");
  }

  // Test 2: Adding 0 fields throws error
  let threw = false;
  try {
    await addFormFieldsToPdf(blank, []);
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected addFormFieldsToPdf to throw on empty fields list.");
  }

  return true;
}
