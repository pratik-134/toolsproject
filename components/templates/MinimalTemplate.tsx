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

export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#0f172a";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-10 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Minimal Header */}
      <header className="space-y-1">
        <h1 className="text-4xl font-light tracking-tight text-slate-950">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-sm font-medium tracking-wide uppercase" style={{ color: accentColor }}>
            {personalInfo.title}
          </p>
        )}

        <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-light">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>}
          {personalInfo.linkedin && (
            <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "in/")}</span>
          )}
        </div>

        {personalInfo.summary && (
          <p className="pt-3 text-xs leading-relaxed text-slate-600 font-light max-w-2xl">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Main Sections */}
      <main className="space-y-5 pt-2">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2"
              style={{ color: accentColor }}
            >
              {section.title}
            </h2>

            <div className="space-y-3">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-medium text-slate-900">
                      <span>{exp.position} — <span className="text-slate-600 font-normal">{exp.company}</span></span>
                      <span className="text-slate-400 font-light">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <div
                        className="mt-1 text-slate-600 font-light leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-slate-600 font-light pl-3 border-l-2 border-slate-100">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-medium text-slate-900">
                      <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>
                      <span className="text-slate-400 font-light">
                        {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                      </span>
                    </div>
                    <div className="text-slate-500 font-light">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</div>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-700 font-light">
                  {(section.items as SkillItem[]).map((s) => (
                    <span key={s.id} className="border-b border-slate-200 pb-0.5">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between font-medium text-slate-900">
                      <span>{proj.title}</span>
                      <span className="text-slate-400 font-light">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-600 font-light mt-0.5">{proj.description}</p>}
                  </div>
                ))}

              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((c) => (
                  <div key={c.id} className="flex justify-between text-xs">
                    <span className="text-slate-800">{c.name} ({c.issuer})</span>
                    <span className="text-slate-400 font-light">{c.issueDate}</span>
                  </div>
                ))}

              {section.type === "languages" && (
                <div className="flex flex-wrap gap-4 text-xs text-slate-700 font-light">
                  {(section.items as LanguageItem[]).map((l) => (
                    <span key={l.id}>{l.language}: {l.fluency}</span>
                  ))}
                </div>
              )}

              {["awards", "publications", "volunteer", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between font-medium text-slate-900">
                      <span>{item.title || item.name || item.organization}</span>
                      <span className="text-slate-400 font-light">{item.date || item.startDate}</span>
                    </div>
                    {item.description && <p className="text-slate-600 font-light mt-0.5">{item.description}</p>}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
