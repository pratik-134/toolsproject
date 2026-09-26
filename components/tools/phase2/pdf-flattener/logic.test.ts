import {
  createSampleFillablePdf,
  countFormFields,
  flattenPdf,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Sample PDF has interactive form fields
  const sample = await createSampleFillablePdf();
  const initialFields = await countFormFields(sample);

  if (initialFields !== 3) {
    throw new Error(`Expected 3 form fields in sample, got ${initialFields}`);
  }

  // Test 2: Flattening removes all interactive fields
  const result = await flattenPdf(sample);
  if (result.fieldCount !== 3) {
    throw new Error(`Expected result.fieldCount to be 3, got ${result.fieldCount}`);
  }

  const flattenedFields = await countFormFields(result.data);
  if (flattenedFields !== 0) {
    throw new Error(`Expected 0 interactive fields after flattening, got ${flattenedFields}`);
  }

  // Test 3: Flattening empty throws
  let threw = false;
  try {
    await flattenPdf(new Uint8Array(0));
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected flattenPdf to throw on empty buffer.");
  }

  return true;
}
