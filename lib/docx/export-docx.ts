import { ResumeData } from "../schema";

/**
 * Generates a native, fully editable Word (.docx) document directly from
 * Cleartrix Resume Builder's ResumeData model and triggers a client-side download in the browser.
 * Entirely client-side and memory-only — zero server dependencies.
 */
export async function exportResumeToDocx(data: ResumeData): Promise<void> {
  try {
    // Dynamic import to optimize bundle size and code-split OOXML packaging
    const [{ Packer }, { getDocxTemplateBuilder }] = await Promise.all([
      import("docx"),
      import("./registry"),
    ]);

    const builder = getDocxTemplateBuilder(data.theme?.templateId);
    const doc = builder(data);

    const blob = await Packer.toBlob(doc);

    const sanitizedName =
      data.personalInfo.fullName.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "Resume";
    const fileName = `${sanitizedName}_Cleartrix.docx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Word (.docx) generation failed:", error);
    throw error;
  }
}
