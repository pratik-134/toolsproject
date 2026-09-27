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
      title={`${personalInfo?.fullName || "Resume"} - Cleartrix Resume Builder`}
      author={personalInfo?.fullName || "Cleartrix User"}
      subject="Professional Resume created with Cleartrix Resume Builder"
      keywords="Resume, CV, Cleartrix, Career"
      creator="Cleartrix (cleartrix.com)"
      producer="Cleartrix Client-Side PDF Engine"
    >
      <TemplateComponent data={data} />
    </Document>
  );
};
