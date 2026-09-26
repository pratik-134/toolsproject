import {
  createSampleFormExtractionPdf,
  extractFormFields,
  formFieldsToCsv,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Sample form extraction
  const sample = await createSampleFormExtractionPdf();
  const fields = await extractFormFields(sample);

  if (fields.length !== 3) {
    throw new Error(`Expected 3 form fields, got ${fields.length}`);
  }

  const nameField = fields.find((f) => f.name === "employee.fullName");
  if (!nameField || nameField.type !== "text" || nameField.value !== "Jordan Lee") {
    throw new Error(`Invalid text field extraction: ${JSON.stringify(nameField)}`);
  }

  const deptField = fields.find((f) => f.name === "employee.department");
  if (!deptField || deptField.type !== "dropdown" || deptField.value !== "Engineering") {
    throw new Error(`Invalid dropdown field extraction: ${JSON.stringify(deptField)}`);
  }

  const checkField = fields.find((f) => f.name === "employee.remoteEligible");
  if (!checkField || checkField.type !== "checkbox" || checkField.value !== "true") {
    throw new Error(`Invalid checkbox field extraction: ${JSON.stringify(checkField)}`);
  }

  // Test 2: CSV formatting
  const csv = formFieldsToCsv(fields);
  if (!csv.includes("employee.fullName") || !csv.includes("Jordan Lee")) {
    throw new Error("CSV formatting did not include expected field rows.");
  }

  // Test 3: Empty buffer throws
  let threw = false;
  try {
    await extractFormFields(new Uint8Array(0));
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected extractFormFields to throw on empty buffer.");
  }

  return true;
}
