import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildTwoColumnDocx } from "../builder-helpers";

export function buildHybridDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildTwoColumnDocx(data, {
    name: "Hybrid Dual-Tone",
    headerAlign: "left",
    isTwoColumn: true,
    sidebarWidthPercent: 32,
    sidebarSections: ["skills", "education", "languages", "certifications", "interests"],
    sectionHeadingStyle: "bottom-line",
  });

  return new Document({
    sections: [
      {
        properties: pageProperties,
        children,
      },
    ],
  });
}
