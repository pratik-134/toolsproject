import React from "react";
import { ResumeData } from "@/lib/schema";
import { PdfDocument } from "./PdfDocument";

export async function exportResumeToPdf(data: ResumeData): Promise<void> {
  try {
    // Dynamic import to avoid any SSR or bundling issues
    const { pdf } = await import("@react-pdf/renderer");

    const blob = await pdf(<PdfDocument data={data} />).toBlob();

    const fileName = `${
      data.personalInfo.fullName.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "Resume"
    }_Cleartrix.pdf`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
