/**
 * Pure Client-Side JSON Schema Validator Logic
 * Zero external libraries, recursive JSON Schema structural validator.
 */

export interface SchemaValidationError {
  path: string;
  message: string;
  expected?: string;
  actual?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: SchemaValidationError[];
}

export function validateJsonSchema(data: unknown, schema: unknown): ValidationResult {
  const errors: SchemaValidationError[] = [];

  if (typeof schema !== "object" || schema === null) {
    throw new Error("Invalid schema: schema must be a JSON object");
  }

  function validateNode(nodeData: unknown, nodeSchema: unknown, path: string) {
    if (typeof nodeSchema !== "object" || nodeSchema === null) return;
    const s = nodeSchema as Record<string, unknown>;

    // 1. Type validation
    if (s.type) {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      const actualType = getActualType(nodeData);

      const typeMatch = types.some((t) => {
        if (t === "integer") return typeof nodeData === "number" && Number.isInteger(nodeData);
        return t === actualType;
      });

      if (!typeMatch) {
        errors.push({
          path,
          message: `Expected type '${types.join(" | ")}' but received '${actualType}'.`,
          expected: String(types.join(" | ")),
          actual: actualType,
        });
        return; // Stop evaluating further on this node if type mismatched
      }
    }

    // 2. Enum validation
    if (Array.isArray(s.enum)) {
      const match = s.enum.some((val) => JSON.stringify(val) === JSON.stringify(nodeData));
      if (!match) {
        errors.push({
          path,
          message: `Value must be one of: [${s.enum.map((e) => JSON.stringify(e)).join(", ")}].`,
          actual: JSON.stringify(nodeData),
        });
      }
    }

    // 3. Number constraints (minimum, maximum)
    if (typeof nodeData === "number") {
      if (typeof s.minimum === "number" && nodeData < s.minimum) {
        errors.push({
          path,
          message: `Value ${nodeData} is less than minimum ${s.minimum}.`,
        });
      }
      if (typeof s.maximum === "number" && nodeData > s.maximum) {
        errors.push({
          path,
          message: `Value ${nodeData} is greater than maximum ${s.maximum}.`,
        });
      }
    }

    // 4. String constraints (minLength, maxLength, pattern)
    if (typeof nodeData === "string") {
      if (typeof s.minLength === "number" && nodeData.length < s.minLength) {
        errors.push({
          path,
          message: `String length ${nodeData.length} is less than minLength ${s.minLength}.`,
        });
      }
      if (typeof s.maxLength === "number" && nodeData.length > s.maxLength) {
        errors.push({
          path,
          message: `String length ${nodeData.length} exceeds maxLength ${s.maxLength}.`,
        });
      }
      if (typeof s.pattern === "string") {
        try {
          const regex = new RegExp(s.pattern);
          if (!regex.test(nodeData)) {
            errors.push({
              path,
              message: `String does not match pattern '${s.pattern}'.`,
            });
          }
        } catch {
          // ignore malformed schema regex
        }
      }
    }

    // 5. Object constraints (required, properties)
    if (typeof nodeData === "object" && nodeData !== null && !Array.isArray(nodeData)) {
      const obj = nodeData as Record<string, unknown>;

      if (Array.isArray(s.required)) {
        for (const reqKey of s.required) {
          if (typeof reqKey === "string" && obj[reqKey] === undefined) {
            errors.push({
              path: path === "$" ? `$.${reqKey}` : `${path}.${reqKey}`,
              message: `Required property '${reqKey}' is missing.`,
            });
          }
        }
      }

      if (typeof s.properties === "object" && s.properties !== null) {
        const props = s.properties as Record<string, unknown>;
        for (const [propKey, propSchema] of Object.entries(props)) {
          if (obj[propKey] !== undefined) {
            const nextPath = path === "$" ? `$.${propKey}` : `${path}.${propKey}`;
            validateNode(obj[propKey], propSchema, nextPath);
          }
        }
      }
    }

    // 6. Array constraints (items, minItems, maxItems)
    if (Array.isArray(nodeData)) {
      if (typeof s.minItems === "number" && nodeData.length < s.minItems) {
        errors.push({
          path,
          message: `Array has ${nodeData.length} items, which is less than minItems ${s.minItems}.`,
        });
      }
      if (typeof s.maxItems === "number" && nodeData.length > s.maxItems) {
        errors.push({
          path,
          message: `Array has ${nodeData.length} items, exceeding maxItems ${s.maxItems}.`,
        });
      }

      if (s.items && typeof s.items === "object") {
        nodeData.forEach((item, idx) => {
          validateNode(item, s.items, `${path}[${idx}]`);
        });
      }
    }
  }

  function getActualType(val: unknown): string {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    return typeof val;
  }

  validateNode(data, schema, "$");

  return {
    isValid: errors.length === 0,
    errors,
  };
}
