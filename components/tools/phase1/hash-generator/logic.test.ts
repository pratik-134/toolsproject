import { generateHashes } from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Empty input
  const empty = await generateHashes("");
  if (empty.md5 !== "" || empty.sha256 !== "") throw new Error("Empty string should return empty hashes");

  // Test 2: Standard string "hello"
  // md5("hello") = 5d41402abc4b2a76b9719d911017c592
  // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
  const res = await generateHashes("hello");
  if (res.md5 !== "5d41402abc4b2a76b9719d911017c592") {
    throw new Error(`MD5 mismatch for "hello": ${res.md5}`);
  }
  if (res.sha256 !== "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824") {
    throw new Error(`SHA256 mismatch for "hello": ${res.sha256}`);
  }
  if (res.sha1 !== "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d") {
    throw new Error(`SHA1 mismatch for "hello": ${res.sha1}`);
  }

  return true;
}
