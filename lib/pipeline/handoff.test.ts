import {
  setPipelineHandoff,
  getPipelineHandoff,
  clearPipelineHandoff,
  getRecommendedPipelineTargets,
  PIPELINE_STORAGE_KEY,
  PIPELINE_EXPIRY_MS,
} from "./handoff";

// Mock localStorage implementation for Node test environment
class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

export function runTests(): boolean {
  const mockStore = new MockStorage();

  // Test 1: Setting and retrieving a text handoff
  const sampleText = "{\"api_key\": \"sec_test_998\", \"status\": \"active\"}";
  const payload = setPipelineHandoff(
    {
      sourceSlug: "json-formatter",
      sourceToolName: "JSON Formatter",
      targetSlug: "client-pastebin",
      dataType: "text",
      title: "Formatted JSON Configuration",
      textData: sampleText,
    },
    mockStore
  );

  if (!payload.id || !payload.createdAt) {
    throw new Error("Pipeline handoff did not generate id or timestamp");
  }

  // Retrieve for matching target
  const received = getPipelineHandoff("client-pastebin", mockStore);
  if (!received || received.textData !== sampleText || received.sourceSlug !== "json-formatter") {
    throw new Error("Failed to retrieve matching pipeline handoff");
  }

  // Retrieve for non-matching target should return null
  const nonMatching = getPipelineHandoff("word-counter", mockStore);
  if (nonMatching !== null) {
    throw new Error("Handoff returned payload for non-matching target slug");
  }

  // Test 2: Clear handoff
  clearPipelineHandoff(mockStore);
  if (getPipelineHandoff("client-pastebin", mockStore) !== null) {
    throw new Error("Handoff was not cleared from storage");
  }

  // Test 3: Expiration check (simulate expired payload)
  const expiredPayload = {
    id: "ct_pipe_expired",
    sourceSlug: "ocr",
    sourceToolName: "OCR",
    targetSlug: "markdown-to-pdf",
    dataType: "text" as const,
    textData: "Extracted document text",
    createdAt: Date.now() - (PIPELINE_EXPIRY_MS + 5000), // 5 seconds past expiry
  };
  mockStore.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(expiredPayload));

  const shouldBeExpired = getPipelineHandoff("markdown-to-pdf", mockStore);
  if (shouldBeExpired !== null) {
    throw new Error("Expired pipeline handoff was not invalidated");
  }

  // Test 4: Recommended target lookup
  const jsonTargets = getRecommendedPipelineTargets("json-formatter", "text");
  if (!jsonTargets.includes("json-to-typescript") || !jsonTargets.includes("client-pastebin")) {
    throw new Error("Pipeline target lookup failed for json-formatter");
  }

  const fallbackTextTargets = getRecommendedPipelineTargets("unmapped-tool", "text");
  if (!fallbackTextTargets.includes("client-pastebin")) {
    throw new Error("Fallback text targets missing expected default");
  }

  return true;
}
