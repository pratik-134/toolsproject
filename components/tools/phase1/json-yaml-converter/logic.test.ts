import { jsonToYaml, yamlToJson } from "./logic";

export function runTests(): boolean {
  // Test 1: JSON to YAML serialization
  const jsonObj = {
    server: {
      port: 8080,
      enabled: true,
      tags: ["web", "api"],
    },
  };

  const yaml = jsonToYaml(jsonObj, { indentSize: 2 });
  if (!yaml.includes("port: 8080") || !yaml.includes("- web") || !yaml.includes("- api")) {
    throw new Error(`Test 1 JSON to YAML failed:\n${yaml}`);
  }

  // Test 2: YAML to JSON parsing
  const yamlInput = `
name: cleartrix
version: 1.0
enabled: true
services:
  - web
  - database
`;

  const jsonStr = yamlToJson(yamlInput);
  const parsed = JSON.parse(jsonStr);

  if (parsed.name !== "cleartrix" || parsed.version !== 1 || parsed.enabled !== true) {
    throw new Error(`Test 2 YAML to JSON failed: ${jsonStr}`);
  }
  if (!Array.isArray(parsed.services) || parsed.services[0] !== "web") {
    throw new Error(`Test 2 services array failed: ${jsonStr}`);
  }

  return true;
}
