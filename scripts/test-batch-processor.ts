import assert from "node:assert";
import { runBatchPool, createZipBlob } from "../lib/batch-processor";

async function runTests() {
  console.log("Testing Client-Side Batch Processing & Worker Pool Engine...");

  // 1. Concurrency control and execution
  const tasks = [1, 2, 3, 4, 5, 6];
  let activeWorkers = 0;
  let maxObservedWorkers = 0;

  const results = await runBatchPool(
    tasks,
    async (item, onProgress) => {
      activeWorkers++;
      maxObservedWorkers = Math.max(maxObservedWorkers, activeWorkers);
      onProgress(50);
      await new Promise((r) => setTimeout(r, 20));
      onProgress(100);
      activeWorkers--;
      return item * 10;
    },
    { concurrency: 3 }
  );

  assert.strictEqual(results.length, 6, "All 6 tasks should produce results");
  assert.ok(
    maxObservedWorkers <= 3,
    `Max active workers (${maxObservedWorkers}) must not exceed concurrency limit of 3`
  );
  assert.deepStrictEqual(
    results.map((r) => r.result),
    [10, 20, 30, 40, 50, 60],
    "Task results must maintain original array order"
  );

  // 2. Error resilience: one task failing does not crash others
  const mixedTasks = ["valid1", "FAIL_THIS", "valid2"];
  const mixedResults = await runBatchPool(
    mixedTasks,
    async (item) => {
      if (item === "FAIL_THIS") {
        throw new Error("Simulated corrupt file");
      }
      return `${item}_processed`;
    },
    { concurrency: 2 }
  );

  assert.strictEqual(mixedResults[0]?.success, true);
  assert.strictEqual(mixedResults[0]?.result, "valid1_processed");
  assert.strictEqual(mixedResults[1]?.success, false);
  assert.strictEqual(mixedResults[1]?.error?.message, "Simulated corrupt file");
  assert.strictEqual(mixedResults[2]?.success, true);
  assert.strictEqual(mixedResults[2]?.result, "valid2_processed");

  // 3. In-Device ZIP Generation
  const testZipFiles = [
    { name: "test1.txt", data: new TextEncoder().encode("Hello Cleartrix 1") },
    { name: "test2.txt", data: new TextEncoder().encode("Hello Cleartrix 2") },
  ];

  const zipBlob = await createZipBlob(testZipFiles);
  assert.ok(zipBlob.size > 0, "ZIP blob size must be greater than zero");
  assert.ok(
    zipBlob.type.includes("zip") || zipBlob.type === "",
    "ZIP mime type should be zip"
  );

  const zipBuffer = new Uint8Array(await zipBlob.arrayBuffer());
  // Standard ZIP local file header signature: PK\x03\x04 (0x50, 0x4b, 0x03, 0x04)
  assert.strictEqual(zipBuffer[0], 0x50, "ZIP magic byte 0 should be 'P'");
  assert.strictEqual(zipBuffer[1], 0x4b, "ZIP magic byte 1 should be 'K'");
  assert.strictEqual(zipBuffer[2], 0x03, "ZIP magic byte 2 should be 0x03");
  assert.strictEqual(zipBuffer[3], 0x04, "ZIP magic byte 3 should be 0x04");

  console.log("All Batch Processing & Worker Pool tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Batch processing tests failed:", err);
  process.exit(1);
});
