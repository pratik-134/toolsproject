import { Document } from "docx";
import { ResumeData } from "@/lib/schema";
import { buildSingleColumnDocx } from "../builder-helpers";

export function buildNordicDocx(data: ResumeData): Document {
  const { pageProperties, children } = buildSingleColumnDocx(data, {
    name: "Nordic Minimal",
    headerAlign: "left",
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
