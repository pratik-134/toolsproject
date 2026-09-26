import React from "react";
import { ResumeData } from "@/lib/schema";
import { getTemplateComponent, TEMPLATES_REGISTRY } from "./registry";

interface TemplateRendererProps {
  data: ResumeData;
  className?: string;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ data, className = "" }) => {
  const templateId = data.theme?.templateId || "modern";
  const TemplateComponent = getTemplateComponent(templateId);
  const templateInfo = TEMPLATES_REGISTRY[templateId];

  // Map fontPair or fallback to template's default font family class
  let fontClass = templateInfo?.fontFamilyClass || "font-sans";
  if (data.theme?.fontPair === "playfair-source" || data.theme?.fontPair === "lora-opensans" || data.theme?.fontPair === "merriweather-sans") {
    fontClass = "font-serif";
  } else if (data.theme?.fontPair === "fira-jetbrains") {
    fontClass = "font-mono";
  } else if (data.theme?.fontPair === "poppins-lato") {
    fontClass = "font-sans";
  }

  return (
    <div className={`${fontClass} ${className}`}>
      <TemplateComponent data={data} />
    </div>
  );
};
