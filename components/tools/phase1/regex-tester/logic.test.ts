import { testRegex } from "./logic";

export function runTests(): boolean {
  // Test 1: Global pattern matching with capture groups
  const res1 = testRegex({
    pattern: "([a-zA-Z]+)@([a-zA-Z0-9.]+)",
    flags: "g",
    testString: "Contact us at support@example.com or sales@test.org today!",
  });

  if (!res1.isValid || res1.matchCount !== 2) {
    throw new Error(`Test 1 failed: expected 2 matches, got ${res1.matchCount}`);
  }
  if (res1.matches[0]?.match !== "support@example.com") {
    throw new Error(`Test 1 match failed: ${res1.matches[0]?.match}`);
  }
  if (res1.matches[0]?.captured[0] !== "support" || res1.matches[0]?.captured[1] !== "example.com") {
    throw new Error(`Test 1 captured groups failed`);
  }

  // Test 2: Named capture groups
  const res2 = testRegex({
    pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",
    flags: "",
    testString: "Event date is 2026-09-24.",
  });

  if (!res2.isValid || res2.matchCount !== 1) {
    throw new Error(`Test 2 failed`);
  }
  if (res2.matches[0]?.groups?.year !== "2026" || res2.matches[0]?.groups?.month !== "09") {
    throw new Error(`Test 2 named groups failed`);
  }

  // Test 3: Replacement pattern
  const res3 = testRegex({
    pattern: "foo",
    flags: "gi",
    testString: "Foo and FOO and foo",
    replacementPattern: "bar",
  });

  if (res3.replaceResult !== "bar and bar and bar") {
    throw new Error(`Test 3 replace failed: ${res3.replaceResult}`);
  }

  // Test 4: Invalid regex syntax error handling
  const res4 = testRegex({
    pattern: "[unclosed-bracket",
    flags: "g",
    testString: "Sample test",
  });

  if (res4.isValid || !res4.errorMessage) {
    throw new Error(`Test 4 should have caught invalid regex`);
  }

  return true;
}
