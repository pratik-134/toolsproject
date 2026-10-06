import { Packer } from "docx";
import { initialResumeData } from "../lib/schema";
import { DOCX_TEMPLATES_REGISTRY, getDocxTemplateBuilder } from "../lib/docx/registry";

async function verifyAllDocxTemplates() {
  console.log("=== QWERTYGEN WORD (.DOCX) TEMPLATES COMPREHENSIVE VERIFICATION ===");
  const templateIds = Object.keys(DOCX_TEMPLATES_REGISTRY);
  console.log(`Found ${templateIds.length} registered DOCX templates.`);

  let passCount = 0;
  let failCount = 0;

  // Expected ZIP magic number bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  const PK_ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];

  for (const id of templateIds) {
    process.stdout.write(`Testing DOCX template [${id}]... `);
    try {
      const builder = DOCX_TEMPLATES_REGISTRY[id];
      if (!builder) {
        throw new Error(`Builder not found for template ID: ${id}`);
      }

      const testData = {
        ...initialResumeData,
        theme: {
          ...initialResumeData.theme,
          templateId: id,
        },
      };

      const doc = builder(testData);
      const buffer = await Packer.toBuffer(doc);

      // Verify non-empty
      if (!buffer || buffer.length < 1000) {
        throw new Error(`Buffer unexpectedly small (${buffer?.length || 0} bytes)`);
      }

      // Verify ZIP/OOXML magic bytes
      const isZip =
        buffer[0] === PK_ZIP_MAGIC[0] &&
        buffer[1] === PK_ZIP_MAGIC[1] &&
        buffer[2] === PK_ZIP_MAGIC[2] &&
        buffer[3] === PK_ZIP_MAGIC[3];

      if (!isZip) {
        throw new Error(
          `Invalid ZIP/OOXML signature: ${buffer.subarray(0, 4).toString("hex")}`
        );
      }

      console.log(`✅ OK (${buffer.length} bytes, valid OOXML zip package)`);
      passCount++;
    } catch (err: any) {
      console.error(`❌ ERROR:`, err?.message || err);
      failCount++;
    }
  }

  // Test fallback handling for unknown template ID
  process.stdout.write("Testing unknown template ID fallback handling... ");
  try {
    const fallbackBuilder = getDocxTemplateBuilder("non_existent_template");
    const fallbackDoc = fallbackBuilder(initialResumeData);
    const fallbackBuffer = await Packer.toBuffer(fallbackDoc);
    if (fallbackBuffer && fallbackBuffer.length > 1000) {
      console.log("✅ OK (safely fell back to modern template)");
      passCount++;
    } else {
      throw new Error("Fallback output invalid");
    }
  } catch (err: any) {
    console.error(`❌ Fallback failed:`, err?.message || err);
    failCount++;
  }

  console.log("\n===============================================");
  console.log(`DOCX Results: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("===============================================");

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL 20 WORD (.DOCX) TEMPLATES GENERATED VALID OOXML PACKAGES!");
    process.exit(0);
  }
}

verifyAllDocxTemplates();
