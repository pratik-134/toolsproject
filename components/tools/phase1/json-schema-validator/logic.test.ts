import { validateJsonSchema } from "./logic";

export function runTests(): boolean {
  // Test 1: Valid object against schema
  const schema1 = {
    type: "object",
    required: ["name", "age"],
    properties: {
      name: { type: "string", minLength: 2 },
      age: { type: "integer", minimum: 18 },
      tags: { type: "array", items: { type: "string" } },
    },
  };

  const validData = {
    name: "Alice",
    age: 25,
    tags: ["engineer", "remote"],
  };

  const res1 = validateJsonSchema(validData, schema1);
  if (!res1.isValid || res1.errors.length > 0) {
    throw new Error(`Test 1 valid data failed: ${JSON.stringify(res1.errors)}`);
  }

  // Test 2: Missing required property & type mismatch
  const invalidData = {
    name: "A", // too short (minLength 2)
    // missing age
    tags: ["tech", 123], // 123 is not string
  };

  const res2 = validateJsonSchema(invalidData, schema1);
  if (res2.isValid || res2.errors.length < 3) {
    throw new Error(`Test 2 expected at least 3 errors, got ${res2.errors.length}`);
  }

  // Test 3: Enum constraint
  const schema3 = {
    type: "object",
    properties: {
      status: { enum: ["active", "pending", "banned"] },
    },
  };

  const res3 = validateJsonSchema({ status: "invalid_status" }, schema3);
  if (res3.isValid) {
    throw new Error("Test 3 enum validation failed");
  }

  return true;
}
