"use client";

import React from "react";
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
} from "@/lib/schema";
import { getComputedResumeLayout } from "@/lib/resume-layout";

interface TemplateProps {
  data: ResumeData;
}

export const AtsSafeTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const layout = getComputedResumeLayout(theme);

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="w-full bg-white text-black leading-normal"
      style={{
        ...layout.dom.containerStyle,
        color: "#000000",
      }}
    >
      {/* ATS-Standard Header */}
      <header
        className="border-b border-black text-center"
        style={{
          paddingBottom: "8px",
          marginBottom: `${layout.density.headerMarginBottomPx}px`,
        }}
      >
        <h1
          className="font-bold uppercase tracking-wider text-black"
          style={{
            fontFamily: layout.fonts.domHeadingFamily,
            fontSize: `${layout.density.fontSize.namePx}px`,
            letterSpacing: "1.5px",
          }}
        >
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p
            className="font-bold text-black mt-0.5 uppercase tracking-wide"
            style={{
              fontFamily: layout.fonts.domHeadingFamily,
              fontSize: `${layout.density.fontSize.titlePx}px`,
            }}
          >
            {personalInfo.title}
          </p>
        )}

        <div className="mt-1 text-xs text-black flex justify-center flex-wrap gap-x-2">
          {[
            personalInfo.location,
            personalInfo.phone,
            personalInfo.email,
            personalInfo.linkedin,
            personalInfo.website,
          ]
            .filter(Boolean)
            .join(" | ")}
        </div>

        {personalInfo.summary && (
          <p
            className="mt-2 text-left text-black"
            style={{
              fontSize: `${layout.density.fontSize.bodyPx}px`,
              lineHeight: layout.density.lineHeight,
            }}
          >
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* ATS Sections (Strict Linear Layout) */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${layout.density.sectionSpacingPx}px`,
        }}
      >
        {activeSections.map((section) => (
          <section
            key={section.id}
            data-section-id={section.id}
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            {/* Standard ATS Heading */}
            <h2
              className="font-bold uppercase tracking-wider border-b border-black"
              style={{
                fontFamily: layout.fonts.domHeadingFamily,
                fontSize: `${layout.density.fontSize.sectionHeadingPx}px`,
                paddingBottom: "2px",
                marginBottom: `${layout.density.itemSpacingPx}px`,
                letterSpacing: "0.8px",
              }}
            >
              {section.title}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${layout.density.itemSpacingPx}px`,
              }}
            >
              {/* Experience */}
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div
                    key={exp.id}
                    style={{
                      breakInside: "avoid",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <div className="flex justify-between font-bold text-black">
                      <span style={{ fontSize: `${layout.density.fontSize.itemTitlePx}px` }}>
                        {exp.company}
                      </span>
                      <span className="text-xs">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between italic text-black/80 text-xs">
                      <span style={{ fontSize: `${layout.density.fontSize.itemSubtitlePx}px` }}>
                        {exp.position}
                      </span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && (
                      <div
                        className="mt-0.5 text-xs text-black"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <div style={layout.dom.bulletListStyle}>
                        {exp.highlights.map((h, i) => (
                          <div key={i} style={layout.dom.bulletItemStyle}>
                            <span style={{ ...layout.dom.bulletMarkerStyle, color: "#000000" }}>
                              •
                            </span>
                            <span style={layout.dom.bulletTextStyle}>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* Education */}
              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div
                    key={edu.id}
                    style={{
                      breakInside: "avoid",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <div className="flex justify-between font-bold text-black">
                      <span style={{ fontSize: `${layout.density.fontSize.itemTitlePx}px` }}>
                        {edu.institution}
                      </span>
                      <span className="text-xs">
                        {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-black/80">
                      <span>
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      </span>
                      <span>{edu.location}</span>
                    </div>
                    {edu.gpa && <div className="text-xs">GPA: {edu.gpa}</div>}
                    {edu.description && <div className="mt-0.5 text-xs">{edu.description}</div>}
                  </div>
                ))}

              {/* Skills */}
              {section.type === "skills" && (
                <div style={{ fontSize: `${layout.density.fontSize.bodyPx}px` }}>
                  <span className="font-bold">Skills: </span>
                  {(section.items as SkillItem[]).map((s, idx, arr) => (
                    <span key={s.id}>
                      {s.name}
                      {idx < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Projects */}
              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      breakInside: "avoid",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <div className="flex justify-between font-bold text-black">
                      <span style={{ fontSize: `${layout.density.fontSize.itemTitlePx}px` }}>
                        {proj.title}
                      </span>
                      <span className="text-xs">
                        {proj.startDate} - {proj.endDate}
                      </span>
                    </div>
                    {proj.link && <div className="text-xs text-black/70">Link: {proj.link}</div>}
                    {proj.description && (
                      <div className="mt-0.5 text-xs text-black">{proj.description}</div>
                    )}
                  </div>
                ))}

              {/* Certifications */}
              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((c) => (
                  <div key={c.id} className="flex justify-between text-xs">
                    <span className="font-bold">
                      {c.name} - {c.issuer}
                    </span>
                    <span>{c.issueDate}</span>
                  </div>
                ))}

              {/* Languages */}
              {section.type === "languages" && (
                <div style={{ fontSize: `${layout.density.fontSize.bodyPx}px` }}>
                  <span className="font-bold">Languages: </span>
                  {(section.items as LanguageItem[]).map((l, i, arr) => (
                    <span key={l.id}>
                      {l.language} ({l.fluency})
                      {i < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Other sections */}
              {["awards", "publications", "volunteer", "references", "custom"].includes(
                section.type
              ) &&
                section.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      breakInside: "avoid",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <div className="flex justify-between font-bold text-xs text-black">
                      <span>{item.title || item.name || item.organization}</span>
                      <span>{item.date || item.startDate}</span>
                    </div>
                    {item.description && (
                      <div className="mt-0.5 text-xs text-black">{item.description}</div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
