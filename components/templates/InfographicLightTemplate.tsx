import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const InfographicLightTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#059669"; // emerald

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-8 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="border-b pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{personalInfo.fullName || "Your Full Name"}</h1>
            {personalInfo.title && (
              <p className="text-sm font-semibold mt-0.5" style={{ color: accentColor }}>
                {personalInfo.title}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {personalInfo.email && <span className="bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-100">{personalInfo.email}</span>}
            {personalInfo.phone && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{personalInfo.phone}</span>}
            {personalInfo.location && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{personalInfo.location}</span>}
          </div>
        </div>
        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-slate-600">{personalInfo.summary}</p>
        )}
      </header>

      <main className="space-y-5">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b flex items-center justify-between"
              style={{ color: accentColor }}
            >
              <span>{section.title}</span>
              <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: accentColor }} />
            </h2>

            <div className="space-y-3 text-xs">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-sm">{exp.position}</span>
                      <span className="text-slate-500 font-medium">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-slate-600 italic font-medium">{exp.company} • {exp.location}</p>
                    {exp.description && (
                      <div className="mt-1 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-slate-700 list-disc ml-4">
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
                      <p className="text-slate-600">{edu.institution} {edu.gpa ? `(GPA ${edu.gpa})` : ""}</p>
                    </div>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {/* Skills with rating dots */}
              {section.type === "skills" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(section.items as SkillItem[]).map((s) => {
                    const rating = s.rating || (s.level === "expert" ? 5 : s.level === "advanced" ? 4 : s.level === "intermediate" ? 3 : 2);
                    return (
                      <div key={s.id} className="flex items-center justify-between border rounded p-1.5 bg-slate-50/50">
                        <span className="font-medium text-slate-800 truncate mr-2">{s.name}</span>
                        <div className="flex gap-1 shrink-0">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <span
                              key={dot}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: dot <= rating ? accentColor : "#e2e8f0",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="border rounded p-2.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{proj.title}</span>
                      <span className="text-slate-500">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-600 mt-1">{proj.description}</p>}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="font-bold text-slate-900">{item.title || item.name || item.organization}</span>
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
