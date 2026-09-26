import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildTwoColumnDocx } from "../builder-helpers";

export function buildCreativeDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildTwoColumnDocx(data, {
    name: "Creative Modern",
    headerAlign: "left",
    isTwoColumn: true,
    sidebarWidthPercent: 30,
    sidebarSections: ["skills", "languages", "certifications", "interests", "education"],
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
