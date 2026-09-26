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

interface TemplateProps {
  data: ResumeData;
}

export const CompactTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#0284c7";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-6 space-y-2.5 shadow-sm print:shadow-none print:min-h-0 print:p-0 text-xs leading-tight"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Compact Top Bar */}
      <header className="border-b pb-2 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none">
            {personalInfo.fullName || "Your Name"}
          </h1>
          {personalInfo.title && (
            <p className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>
              {personalInfo.title}
            </p>
          )}
        </div>
        <div className="text-right text-[10.5px] text-slate-600 space-y-0.5">
          <p>{[personalInfo.email, personalInfo.phone].filter(Boolean).join(" • ")}</p>
          <p>{[personalInfo.location, personalInfo.linkedin, personalInfo.website].filter(Boolean).join(" • ")}</p>
        </div>
      </header>

      {personalInfo.summary && (
        <p className="text-[11px] text-slate-600 italic border-l-2 pl-2 py-0.5" style={{ borderColor: accentColor }}>
          {personalInfo.summary}
        </p>
      )}

      {/* Sections */}
      <main className="space-y-2">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5 mb-1"
              style={{ color: accentColor, borderColor: `${accentColor}40` }}
            >
              {section.title}
            </h2>

            <div className="space-y-1.5">
              {/* Experience */}
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.position}, <span className="font-normal text-slate-600">{exp.company}</span></span>
                      <span className="text-slate-500 font-normal">
                        {exp.startDate}–{exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <div
                        className="text-slate-700 leading-snug"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-4 text-slate-700 space-y-0.5">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {/* Education */}
              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between text-[11px]">
                    <span>
                      <strong>{edu.degree}</strong> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""} — {edu.institution}
                      {edu.gpa && ` (GPA ${edu.gpa})`}
                    </span>
                    <span className="text-slate-500">{edu.startDate}–{edu.endDate}</span>
                  </div>
                ))}

              {/* Skills */}
              {section.type === "skills" && (
                <div className="text-[11px] text-slate-700 leading-normal">
                  {(section.items as SkillItem[]).map((s, idx, arr) => (
                    <span key={s.id}>
                      <strong className="text-slate-900">{s.name}</strong>
                      {idx < arr.length - 1 ? " • " : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Projects */}
              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="text-[11px]">
                    <span className="font-bold text-slate-900">{proj.title}</span>:{" "}
                    <span className="text-slate-700">{proj.description}</span>
                  </div>
                ))}

              {/* Certifications */}
              {section.type === "certifications" && (
                <div className="text-[11px] text-slate-700">
                  {(section.items as CertificationItem[]).map((c, i, arr) => (
                    <span key={c.id}>
                      {c.name} ({c.issuer}){i < arr.length - 1 ? "; " : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Languages */}
              {section.type === "languages" && (
                <div className="text-[11px] text-slate-700">
                  {(section.items as LanguageItem[]).map((l, i, arr) => (
                    <span key={l.id}>
                      {l.language} ({l.fluency}){i < arr.length - 1 ? " • " : ""}
                    </span>
                  ))}
                </div>
              )}

              {["awards", "publications", "volunteer", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="text-[11px] flex justify-between">
                    <span><strong>{item.title || item.name || item.organization}</strong> {item.description && `— ${item.description}`}</span>
                    <span className="text-slate-500">{item.date || item.startDate}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
