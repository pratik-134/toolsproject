import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildSingleColumnDocx } from "../builder-helpers";

export function buildCorporateDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildSingleColumnDocx(data, {
    name: "Corporate Executive",
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
