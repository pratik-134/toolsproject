import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildSingleColumnDocx } from "../builder-helpers";

export function buildMinimalDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildSingleColumnDocx(data, {
    name: "Minimal Clean",
    headerAlign: "left",
    headerVariant: "minimal",
    sectionHeadingStyle: "clean",
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
