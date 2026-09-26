import { jsonToXml, xmlToJson } from "./logic";

export function runTests(): boolean {
  // Test 1: JSON to XML serialization
  const jsonObj = {
    user: {
      name: "Alice",
      age: 30,
      active: true,
    },
  };

  const xmlOut = jsonToXml(jsonObj, { rootName: "user", declaration: false });
  if (!xmlOut.includes("<name>Alice</name>") || !xmlOut.includes("<age>30</age>")) {
    throw new Error(`Test 1 JSON to XML failed:\n${xmlOut}`);
  }

  // Test 2: Array handling in JSON to XML
  const jsonArray = {
    items: {
      item: ["One", "Two", "Three"],
    },
  };
  const xmlArrayOut = jsonToXml(jsonArray, { declaration: false });
  if (!xmlArrayOut.includes("<item>One</item>") || !xmlArrayOut.includes("<item>Two</item>")) {
    throw new Error(`Test 2 Array to XML failed:\n${xmlArrayOut}`);
  }

  // Test 3: XML to JSON parsing (fallback in Node environment)
  const sampleXml = `<root><title>Mindkit</title><version>1.0</version></root>`;
  const jsonOut = xmlToJson(sampleXml);
  const parsed = JSON.parse(jsonOut);

  if (!parsed.root || parsed.root.title !== "Mindkit" || parsed.root.version !== 1) {
    throw new Error(`Test 3 XML to JSON failed: ${jsonOut}`);
  }

  return true;
}
