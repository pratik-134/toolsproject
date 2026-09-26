import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const NordicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#475569"; // slate grey

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-[#f8fafc] text-slate-700 p-10 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0 text-xs font-light"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-light tracking-wider uppercase text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-xs font-normal tracking-widest uppercase text-slate-500">{personalInfo.title}</p>
        )}
        <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-400">
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website].filter(Boolean).map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        {personalInfo.summary && <p className="pt-2 text-slate-600 leading-relaxed max-w-2xl">{personalInfo.summary}</p>}
      </header>

      <main className="space-y-6">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-[11px] font-normal uppercase tracking-[0.2em] text-slate-400 mb-2 border-b border-slate-200 pb-1"
              style={{ color: accentColor }}
            >
              {section.title}
            </h2>

            <div className="space-y-3">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-normal text-slate-900">
                      <span><strong>{exp.position}</strong> — {exp.company}</span>
                      <span className="text-slate-400 text-[11px]">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    {exp.description && <div className="mt-1 text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-4 space-y-0.5 text-slate-600 mt-1">
                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <span className="font-medium text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-slate-500">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <span className="text-slate-400">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-2">
                  {(section.items as SkillItem[]).map((s) => (
                    <span key={s.id} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 text-[11px]">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between font-medium text-slate-900">
                      <span>{proj.title}</span>
                      <span className="text-slate-400">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-600 mt-0.5">{proj.description}</p>}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="font-medium text-slate-900">{item.title || item.name || item.organization}</span>
                    <span className="text-slate-400">{item.date || item.issueDate}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
