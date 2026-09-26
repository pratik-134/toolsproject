import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildSingleColumnDocx } from "../builder-helpers";

export function buildModernDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildSingleColumnDocx(data, {
    name: "Modern Sans",
    headerAlign: "left",
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
