import { csvToJson, jsonToCsv } from "./logic";

export function runTests(): boolean {
  // Test 1: CSV to JSON
  const sampleCsv = `name,role,experience,active
Alice,Senior Architect,8,true
Bob,Frontend Engineer,4,false
"Charlie, Jr.",Designer,5,true`;

  const jsonRes = csvToJson(sampleCsv);
  if (!jsonRes.success) throw new Error(`CSV to JSON failed: ${jsonRes.error}`);
  const parsed = JSON.parse(jsonRes.output);
  if (parsed.length !== 3) throw new Error(`Expected 3 records, got ${parsed.length}`);
  if (parsed[0].experience !== 8 || parsed[0].active !== true) throw new Error("Type casting failed");
  if (parsed[2].name !== "Charlie, Jr.") throw new Error("Quoted comma cell parsing failed");

  // Test 2: JSON to CSV
  const csvRes = jsonToCsv(jsonRes.output);
  if (!csvRes.success) throw new Error(`JSON to CSV failed: ${csvRes.error}`);
  if (!csvRes.output.includes("name,role,experience,active")) throw new Error("CSV header missing");
  if (!csvRes.output.includes('"Charlie, Jr."')) throw new Error("Quoted CSV value missing");

  return true;
}
