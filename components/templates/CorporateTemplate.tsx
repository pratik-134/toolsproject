import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const CorporateTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e40af"; // deep blue

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-8 space-y-5 shadow-sm print:shadow-none print:min-h-0 print:p-0 text-xs"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <header className="border-b-2 pb-3" style={{ borderColor: accentColor }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{personalInfo.fullName || "Your Full Name"}</h1>
            {personalInfo.title && <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-0.5">{personalInfo.title}</p>}
          </div>
          <div className="text-right text-slate-600 text-[11px] space-y-0.5">
            <p>{[personalInfo.email, personalInfo.phone].filter(Boolean).join(" | ")}</p>
            <p>{[personalInfo.location, personalInfo.linkedin].filter(Boolean).join(" | ")}</p>
          </div>
        </div>
        {personalInfo.summary && <p className="mt-2 text-slate-700 leading-normal">{personalInfo.summary}</p>}
      </header>

      <main className="space-y-4">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <div className="bg-slate-100 px-2 py-1 mb-2 border-l-4" style={{ borderColor: accentColor }}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {section.title}
              </h2>
            </div>

            <div className="space-y-2.5 px-1">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.position} — <span className="font-semibold text-slate-600">{exp.company}</span></span>
                      <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    {exp.description && <div className="text-slate-700 mt-0.5" dangerouslySetInnerHTML={{ __html: exp.description }} />}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-4 space-y-0.5 text-slate-700 mt-0.5">
                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-slate-600">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-slate-700">
                  {(section.items as SkillItem[]).map((s) => (
                    <div key={s.id} className="border-b pb-0.5">• {s.name}</div>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between font-bold">
                      <span>{proj.title}</span>
                      <span className="text-slate-500 font-normal">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-700 mt-0.5">{proj.description}</p>}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="font-bold">{item.title || item.name || item.organization}</span>
                    <span className="text-slate-500">{item.date || item.issueDate}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
