import { computeDiff } from "./logic";

export function runTests(): boolean {
  // Test 1: Simple insertion and deletion
  const orig = "apple\nbanana\norange";
  const mod = "apple\ngrape\norange\npeach";

  const res = computeDiff(orig, mod);
  if (res.unchanged !== 2) {
    throw new Error(`Expected 2 unchanged lines (apple, orange), got ${res.unchanged}`);
  }
  if (res.deletions !== 1) {
    throw new Error(`Expected 1 deletion (banana), got ${res.deletions}`);
  }
  if (res.additions !== 2) {
    throw new Error(`Expected 2 additions (grape, peach), got ${res.additions}`);
  }

  // Test 2: Ignore whitespace
  const origWs = "  hello world  \nfoo";
  const modWs = "hello world\nfoo";
  const resWs = computeDiff(origWs, modWs, { ignoreWhitespace: true });
  if (resWs.unchanged !== 2) {
    throw new Error(`Expected 2 unchanged with ignoreWhitespace, got ${resWs.unchanged}`);
  }

  return true;
}
