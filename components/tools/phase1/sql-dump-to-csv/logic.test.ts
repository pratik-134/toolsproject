import { parseSqlDump } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard multi-row MySQL dump
  const sampleSql = `
    INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`score\`, \`notes\`, \`is_active\`) VALUES
    (1, 'Alice Smith', 'alice@example.com', 95.5, 'Team lead, core\\ncontributor', 1),
    (2, 'Bob O''Connor', 'bob@example.com', 88.0, 'Senior dev', 1),
    (3, 'Charlie "Chuck" Brown', 'charlie@example.com', NULL, NULL, 0);
  `;

  const res = parseSqlDump(sampleSql);

  if (res.activeTable !== "users") {
    throw new Error(`Expected active table 'users', got '${res.activeTable}'`);
  }
  if (res.columns.length !== 6) {
    throw new Error(`Expected 6 columns, got ${res.columns.length}`);
  }
  if (res.rows.length !== 3) {
    throw new Error(`Expected 3 rows, got ${res.rows.length}`);
  }

  // Row 1 assertions
  const r0 = res.rows[0]!;
  if (r0[0] !== "1" || r0[1] !== "Alice Smith") {
    throw new Error(`Unexpected row 0 values: ${JSON.stringify(r0)}`);
  }

  // Row 2 escaped quote assertion: Bob O'Connor
  const r1 = res.rows[1]!;
  if (r1[1] !== "Bob O'Connor") {
    throw new Error(`Expected 'Bob O''Connor' to parse as "Bob O'Connor", got '${r1[1]}'`);
  }

  // Row 3 NULL assertion
  const r2 = res.rows[2]!;
  if (r2[3] !== null || r2[4] !== null) {
    throw new Error(`Expected NULL fields, got ${JSON.stringify(r2)}`);
  }

  // Test 2: CSV formatting includes escaped quotes and newlines
  if (!res.csv.includes('"Team lead, core\ncontributor"')) {
    throw new Error("CSV should quote fields containing commas and newlines");
  }

  // Test 3: Multiple tables in same SQL file
  const multiTableSql = `
    INSERT INTO "departments" ("id", "name") VALUES (1, 'Engineering');
    INSERT INTO "roles" ("id", "title") VALUES (10, 'Software Architect');
  `;

  const multiRes = parseSqlDump(multiTableSql);
  if (multiRes.tableNames.length !== 2) {
    throw new Error(`Expected 2 tables, got ${multiRes.tableNames.length}`);
  }
  if (!multiRes.tableNames.includes("departments") || !multiRes.tableNames.includes("roles")) {
    throw new Error("Tables array must include 'departments' and 'roles'");
  }

  return true;
}
