import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildSingleColumnDocx } from "../builder-helpers";

export function buildTechDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildSingleColumnDocx(data, {
    name: "Tech & Developer",
    headerAlign: "left",
    fontFamily: "JetBrainsMono",
    headingFontFamily: "JetBrainsMono",
    sectionHeadingStyle: "thick-line",
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
