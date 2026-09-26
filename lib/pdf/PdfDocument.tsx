import React from "react";
import { Document } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/schema";
import { getPdfTemplateComponent } from "./registry";

interface PdfDocumentProps {
  data: ResumeData;
}

export const PdfDocument: React.FC<PdfDocumentProps> = ({ data }) => {
  const { personalInfo, theme } = data;
  const TemplateComponent = getPdfTemplateComponent(theme?.templateId);

  return (
    <Document
      title={`${personalInfo?.fullName || "Resume"} - Mindkit Resume Builder`}
      author={personalInfo?.fullName || "Mindkit User"}
      subject="Professional Resume created with Mindkit Resume Builder"
      keywords="Resume, CV, Mindkit, Career"
      creator="Mindkit (mindkit.dev)"
      producer="Mindkit Client-Side PDF Engine"
    >
      <TemplateComponent data={data} />
    </Document>
  );
};
