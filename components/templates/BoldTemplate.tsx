import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const BoldTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#18181b";

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-900 p-8 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 pb-4" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-950">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          {personalInfo.title && (
            <p className="text-sm font-bold uppercase tracking-wider mt-1 text-slate-600">
              {personalInfo.title}
            </p>
          )}
        </div>
        <div className="mt-2 sm:mt-0 text-right text-xs font-semibold text-slate-600 space-y-0.5">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
        </div>
      </header>

      {personalInfo.summary && (
        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-100 p-3 rounded-md">
          {personalInfo.summary}
        </p>
      )}

      <main className="space-y-6">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-3.5 w-2" style={{ backgroundColor: accentColor }} />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">
                {section.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs font-medium">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-sm text-slate-950">{exp.position}</span>
                      <span className="font-bold text-slate-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-slate-600 font-bold">{exp.company} • {exp.location}</p>
                    {exp.description && (
                      <div className="text-slate-700 font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-4 space-y-0.5 text-slate-700 font-normal">
                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-extrabold text-slate-950">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-slate-600 font-bold">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <span className="text-slate-500 font-bold">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-2">
                  {(section.items as SkillItem[]).map((s) => (
                    <span key={s.id} className="bg-slate-900 text-white px-2.5 py-1 rounded text-xs font-bold">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="border-l-4 pl-3 py-0.5 space-y-0.5" style={{ borderColor: accentColor }}>
                    <div className="flex justify-between font-extrabold text-slate-950">
                      <span>{proj.title}</span>
                      <span className="font-bold text-slate-500">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-700 font-normal">{proj.description}</p>}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="font-extrabold text-slate-950">{item.title || item.name || item.organization}</span>
                    <span className="text-slate-500 font-bold">{item.date || item.issueDate}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
