import { parseCron, explainCron, PRESETS } from "./logic";

export function runTests(): boolean {
  // Test 1: Preset validity
  for (const preset of PRESETS) {
    const parsed = parseCron(preset.cron);
    if (!parsed.isValid) {
      throw new Error(`Preset '${preset.label}' (${preset.cron}) failed validation`);
    }
  }

  // Test 2: Token extraction
  const parsedWeekday = parseCron("0 9 * * 1-5");
  if (
    parsedWeekday.minute !== "0" ||
    parsedWeekday.hour !== "9" ||
    parsedWeekday.dom !== "*" ||
    parsedWeekday.month !== "*" ||
    parsedWeekday.dow !== "1-5" ||
    !parsedWeekday.isValid
  ) {
    throw new Error(`Unexpected parse result for '0 9 * * 1-5': ${JSON.stringify(parsedWeekday)}`);
  }

  // Test 3: Invalid token counts
  const tooFew = parseCron("0 9 *");
  if (tooFew.isValid) {
    throw new Error("Expected 3-token cron to be invalid");
  }
  const tooMany = parseCron("0 9 * * 1-5 extra");
  if (tooMany.isValid) {
    throw new Error("Expected 6-token cron to be invalid");
  }

  // Test 4: Explanation text for common patterns
  const expEvery5Min = explainCron(parseCron("*/5 * * * *"));
  if (!expEvery5Min.includes("every 5 minutes")) {
    throw new Error(`Expected explanation to contain 'every 5 minutes', got: ${expEvery5Min}`);
  }

  const expEveryWeekday = explainCron(parseCron("0 9 * * 1-5"));
  if (!expEveryWeekday.includes("9:00 AM") || !expEveryWeekday.includes("weekday")) {
    throw new Error(`Expected explanation for weekday 9am, got: ${expEveryWeekday}`);
  }

  const expEverySunday = explainCron(parseCron("0 2 * * 0"));
  if (!expEverySunday.includes("2:00 AM") || !expEverySunday.includes("Sunday")) {
    throw new Error(`Expected explanation for Sunday 2am, got: ${expEverySunday}`);
  }

  const expMonthly = explainCron(parseCron("0 0 1 * *"));
  if (!expMonthly.includes("day 1 of the month")) {
    throw new Error(`Expected day 1 explanation, got: ${expMonthly}`);
  }

  // Test 5: Invalid explanation fallback
  const invalidExp = explainCron(parseCron("bad cron"));
  if (!invalidExp.includes("Invalid cron expression")) {
    throw new Error(`Expected invalid explanation error message, got: ${invalidExp}`);
  }

  return true;
}
