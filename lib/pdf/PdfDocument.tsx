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
      title={`${personalInfo?.fullName || "Resume"} - Qwertygen Resume Builder`}
      author={personalInfo?.fullName || "Qwertygen User"}
      subject="Professional Resume created with Qwertygen Resume Builder"
      keywords="Resume, CV, Qwertygen, Career"
      creator="Qwertygen (qwertygen.com)"
      producer="Qwertygen Client-Side PDF Engine"
    >
      <TemplateComponent data={data} />
    </Document>
  );
};
