import {
  generateCertificateId,
  validateCertificate,
  DEFAULT_CERTIFICATE,
  CERTIFICATE_TEMPLATES,
} from "./logic";

export function runTests(): boolean {
  // Test 1: ID generation format
  const id = generateCertificateId("TEST");
  if (!id.startsWith("TEST-") || id.split("-").length !== 3) {
    throw new Error(`Unexpected certificate ID format: ${id}`);
  }

  // Test 2: Validation of DEFAULT_CERTIFICATE
  const val = validateCertificate(DEFAULT_CERTIFICATE);
  if (!val.valid) {
    throw new Error(`Default certificate failed validation: ${val.errors.join(", ")}`);
  }

  // Test 3: Validation of missing fields
  const badVal = validateCertificate({ recipientName: "" });
  if (badVal.valid || badVal.errors.length === 0) {
    throw new Error("Expected validation errors for missing certificate fields");
  }

  // Test 4: Templates availability
  if (CERTIFICATE_TEMPLATES.length < 3) {
    throw new Error("Expected at least 3 certificate templates");
  }

  return true;
}
