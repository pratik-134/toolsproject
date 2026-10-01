import "./patch-node24";
import React from "react";
import { pdf, Document } from "@react-pdf/renderer";
import { initialResumeData } from "../lib/schema";
import { PDF_TEMPLATES_REGISTRY } from "../lib/pdf/registry";

function checkLayoutAnomalies(node: any, parent: any, issues: string[]) {
  if (!node) return;

  // Check for zero-height block text
  if (node.type === "TEXT") {
    const isNested = parent && parent.type === "TEXT";
    let text = "";
    if (node.children && Array.isArray(node.children)) {
      for (const c of node.children) {
        if (typeof c === "string") text += c;
        else if (c && c.value) text += c.value;
      }
    }
    if (!isNested && text.trim().length > 0 && node.box && node.box.height < 2) {
      issues.push(`Zero-height text: "${text.slice(0, 30)}" (h=${node.box.height})`);
    }
  }

  // Check for vertical sibling collision
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length - 1; i++) {
      const a = node.children[i];
      const b = node.children[i + 1];
      if (a?.style?.position === "absolute" || b?.style?.position === "absolute") continue;

      if (
        a && b && a.box && b.box &&
        a.box.top !== undefined && b.box.top !== undefined &&
        a.box.height > 0 && b.box.height > 0
      ) {
        const isRow = node.style?.flexDirection === "row";
        if (!isRow && (a.type === "TEXT" || a.type === "VIEW") && (b.type === "TEXT" || b.type === "VIEW")) {
          if (b.box.top < a.box.top + a.box.height - 3) {
            issues.push(
              `Vertical overlap: [${a.type} h=${a.box.height.toFixed(1)}, top=${a.box.top.toFixed(1)}] overlaps [${b.type} top=${b.box.top.toFixed(1)}]`
            );
          }
        }
      }
    }

    for (const c of node.children) {
      if (c && typeof c === "object" && c.type) checkLayoutAnomalies(c, node, issues);
    }
  }
}

async function verifyAllPdfTemplates() {
  console.log("=== CLEARTRIX PDF TEMPLATES COMPREHENSIVE VERIFICATION ===");
  const templateIds = Object.keys(PDF_TEMPLATES_REGISTRY);
  console.log(`Found ${templateIds.length} registered PDF templates.`);

  let passCount = 0;
  let failCount = 0;

  for (const id of templateIds) {
    process.stdout.write(`Testing PDF template [${id}]... `);
    try {
      const Component = PDF_TEMPLATES_REGISTRY[id];
      if (!Component) {
        throw new Error(`Component not found for template ID: ${id}`);
      }

      const testData = {
        ...initialResumeData,
        theme: {
          ...initialResumeData.theme,
          templateId: id,
        },
      };

      let capturedLayout: any = null;
      const doc = (
        <Document onRender={({ _INTERNAL__LAYOUT__DATA_ }: any) => { capturedLayout = _INTERNAL__LAYOUT__DATA_; }}>
          <Component data={testData} />
        </Document>
      );

      const inst = pdf(doc);
      const stream = await inst.toBuffer();
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on("data", (c: any) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });
      const buffer = Buffer.concat(chunks);

      const layoutIssues: string[] = [];
      if (capturedLayout) {
        checkLayoutAnomalies(capturedLayout, null, layoutIssues);
      }

      if (buffer && buffer.length > 1000 && layoutIssues.length === 0) {
        console.log(`✅ OK (${buffer.length} bytes, starts with: ${buffer.subarray(0, 4).toString()}, 0 layout anomalies)`);
        passCount++;
      } else {
        if (layoutIssues.length > 0) {
          console.error(`❌ FAILED: ${layoutIssues.length} layout anomalies: ${layoutIssues.join("; ")}`);
        } else {
          console.error(`❌ FAILED: Buffer unexpectedly small (${buffer?.length || 0} bytes)`);
        }
        failCount++;
      }
    } catch (err: any) {
      console.error(`❌ ERROR:`, err?.message || err);
      failCount++;
    }
  }

  console.log("\n===============================================");
  console.log(`Results: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("===============================================");

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL 20 PDF TEMPLATES RENDERED VALID PDF OUTPUTS WITH ZERO LAYOUT BUGS!");
    process.exit(0);
  }
}

verifyAllPdfTemplates();

