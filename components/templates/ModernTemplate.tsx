import React from "react";
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  AwardItem,
  VolunteerItem,
  ReferenceItem,
  CustomItem,
} from "@/lib/schema";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  ExternalLink,
} from "lucide-react";

import { getComputedResumeLayout } from "@/lib/resume-layout";

interface TemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const layout = getComputedResumeLayout(theme);
  const accentColor = layout.accentColor;
  const showIcons = layout.showIcons;

  // Sort and filter active sections
  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="w-full bg-white text-slate-800"
      style={{
        ...layout.dom.containerStyle,
      }}
    >
      {/* Header / Personal Info */}
      <header
        className="border-b"
        style={{
          borderBottomColor: "#e2e8f0",
          borderBottomWidth: "1.5px",
          paddingBottom: `${layout.density.itemSpacingPx}px`,
          marginBottom: `${layout.density.headerMarginBottomPx}px`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1
              className="font-extrabold tracking-tight"
              style={{
                fontFamily: layout.fonts.domHeadingFamily,
                fontSize: `${layout.density.fontSize.namePx}px`,
                color: accentColor,
                lineHeight: 1.15,
              }}
            >
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {personalInfo.title && (
              <p
                className="font-semibold text-slate-600 mt-0.5"
                style={{
                  fontSize: `${layout.density.fontSize.titlePx}px`,
                }}
              >
                {personalInfo.title}
              </p>
            )}
          </div>

          {/* Photo if provided and visible */}
          {personalInfo.photo?.url && personalInfo.photo.visible && (
            <div className="shrink-0">
              <img
                src={personalInfo.photo.url}
                alt={personalInfo.fullName}
                className={`object-cover border-2 ${
                  personalInfo.photo.shape === "circle"
                    ? "rounded-full"
                    : personalInfo.photo.shape === "rounded"
                    ? "rounded-xl"
                    : "rounded-none"
                }`}
                style={{
                  width: `${personalInfo.photo.size || 80}px`,
                  height: `${personalInfo.photo.size || 80}px`,
                  borderColor: accentColor,
                }}
              />
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              className="flex items-center gap-1 hover:underline"
            >
              {showIcons && <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />}
              <span>{personalInfo.email}</span>
            </a>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              {showIcons && <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />}
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              {showIcons && <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />}
              <span>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.website && (
            <a
              href={personalInfo.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              {showIcons && <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />}
              <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          {personalInfo.linkedin && (
            <a
              href={`https://${personalInfo.linkedin.replace(/^https?:\/\//, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              {showIcons && <Linkedin className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />}
              <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "in/")}</span>
            </a>
          )}
          {personalInfo.github && (
            <a
              href={`https://${personalInfo.github.replace(/^https?:\/\//, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              {showIcons && <Github className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />}
              <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, "gh/")}</span>
            </a>
          )}
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mt-3 text-xs leading-relaxed text-slate-700">
            <p>{personalInfo.summary}</p>
          </div>
        )}
      </header>

      {/* Main Sections */}
      <main style={{ display: "flex", flexDirection: "column", gap: `${layout.density.sectionSpacingPx}px` }}>
        {activeSections.map((section) => (
          <section
            key={section.id}
            data-section-id={section.id}
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            {/* Section Header */}
            <div
              className="flex items-center gap-2 border-b"
              style={{
                borderBottomColor: accentColor,
                borderBottomWidth: "1.5px",
                paddingBottom: "2px",
                marginBottom: `${layout.density.itemSpacingPx}px`,
              }}
            >
              <h2
                className="font-bold uppercase tracking-wider"
                style={{
                  fontFamily: layout.fonts.domHeadingFamily,
                  fontSize: `${layout.density.fontSize.sectionHeadingPx}px`,
                  color: accentColor,
                }}
              >
                {section.title}
              </h2>
            </div>

            {/* Dynamic Items Based on Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: `${layout.density.itemSpacingPx}px` }}>
              {/* WORK EXPERIENCE */}
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline">
                      <h3
                        className="font-bold text-slate-900"
                        style={{ fontSize: `${layout.density.fontSize.itemTitlePx}px` }}
                      >
                        {exp.position}
                      </h3>
                      <span className="text-slate-500 font-medium shrink-0 text-xs">
                        {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-slate-600 italic"
                      style={{ fontSize: `${layout.density.fontSize.itemSubtitlePx}px` }}
                    >
                      <span>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && (
                      <div
                        className="mt-1 text-slate-700 leading-relaxed [&>p]:mb-1 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 text-xs"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <div style={layout.dom.bulletListStyle}>
                        {exp.highlights.map((h, i) => (
                          <div key={i} style={layout.dom.bulletItemStyle}>
                            <span style={layout.dom.bulletMarkerStyle}>•</span>
                            <span style={layout.dom.bulletTextStyle}>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* EDUCATION */}
              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      </h3>
                      <span className="text-slate-500 font-medium shrink-0">
                        {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                        {edu.current ? "Present" : edu.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 italic">
                      <span>{edu.institution}</span>
                      <span>{edu.location}</span>
                    </div>
                    {(edu.gpa || edu.honors) && (
                      <div className="text-slate-600 mt-0.5">
                        {edu.gpa && <span>GPA: {edu.gpa} </span>}
                        {edu.honors && <span>• {edu.honors}</span>}
                      </div>
                    )}
                    {edu.description && (
                      <p className="mt-1 text-slate-700">{edu.description}</p>
                    )}
                  </div>
                ))}

              {/* SKILLS */}
              {section.type === "skills" && (
                <div className="flex flex-wrap gap-1.5">
                  {(section.items as SkillItem[]).map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800"
                    >
                      {skill.name}
                      {skill.level !== "none" && (
                        <span className="ml-1 text-[10px] text-slate-500 font-normal">
                          ({skill.level})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* PROJECTS */}
              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {proj.title}
                        </h3>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-slate-500 font-medium shrink-0">
                        {proj.startDate} {proj.startDate && proj.endDate ? "–" : ""}{" "}
                        {proj.endDate}
                      </span>
                    </div>
                    {proj.subtitle && (
                      <p className="text-slate-600 italic">{proj.subtitle}</p>
                    )}
                    {proj.description && (
                      <p className="mt-1 text-slate-700 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* CERTIFICATIONS */}
              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((cert) => (
                  <div key={cert.id} className="flex justify-between text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900">{cert.name}</h3>
                      <p className="text-slate-600">{cert.issuer}</p>
                    </div>
                    <div className="text-right text-slate-500">
                      <span>{cert.issueDate}</span>
                      {cert.credentialId && (
                        <p className="text-[10px]">ID: {cert.credentialId}</p>
                      )}
                    </div>
                  </div>
                ))}

              {/* LANGUAGES */}
              {section.type === "languages" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(section.items as LanguageItem[]).map((lang) => (
                    <div key={lang.id} className="flex justify-between border-b pb-1">
                      <span className="font-medium text-slate-800">
                        {lang.language}
                      </span>
                      <span className="text-slate-500">{lang.fluency}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* AWARDS */}
              {section.type === "awards" &&
                (section.items as AwardItem[]).map((award) => (
                  <div key={award.id} className="text-xs">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-slate-900">{award.title}</h3>
                      <span className="text-slate-500">{award.date}</span>
                    </div>
                    <p className="text-slate-600">{award.issuer}</p>
                    {award.description && (
                      <p className="mt-0.5 text-slate-700">{award.description}</p>
                    )}
                  </div>
                ))}

              {/* VOLUNTEER */}
              {section.type === "volunteer" &&
                (section.items as VolunteerItem[]).map((vol) => (
                  <div key={vol.id} className="text-xs">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-slate-900">
                        {vol.role} — {vol.organization}
                      </h3>
                      <span className="text-slate-500">
                        {vol.startDate} {vol.startDate && (vol.endDate || vol.current) ? "–" : ""}{" "}
                        {vol.current ? "Present" : vol.endDate}
                      </span>
                    </div>
                    {vol.description && (
                      <p className="mt-0.5 text-slate-700">{vol.description}</p>
                    )}
                  </div>
                ))}

              {/* REFERENCES */}
              {section.type === "references" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {(section.items as ReferenceItem[]).map((ref) => (
                    <div key={ref.id} className="rounded border p-2 bg-slate-50/50">
                      <h3 className="font-bold text-slate-900">{ref.name}</h3>
                      <p className="text-slate-600">
                        {ref.relationship} {ref.company ? `at ${ref.company}` : ""}
                      </p>
                      {ref.email && <p className="text-slate-500">{ref.email}</p>}
                      {ref.phone && <p className="text-slate-500">{ref.phone}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* CUSTOM SECTION */}
              {section.type === "custom" &&
                (section.items as CustomItem[]).map((item) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      {item.date && <span className="text-slate-500">{item.date}</span>}
                    </div>
                    {item.subtitle && (
                      <p className="text-slate-600 italic">{item.subtitle}</p>
                    )}
                    {item.description && (
                      <p className="mt-0.5 text-slate-700">{item.description}</p>
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
