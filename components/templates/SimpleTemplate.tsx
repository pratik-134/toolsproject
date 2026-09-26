import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const SimpleTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections } = data;
  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-900 p-8 space-y-4 shadow-sm print:shadow-none print:min-h-0 print:p-0 text-xs"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-950">{personalInfo.fullName || "Your Full Name"}</h1>
        {personalInfo.title && <p className="text-sm text-slate-600">{personalInfo.title}</p>}
        <div className="text-xs text-slate-500 flex flex-wrap gap-x-3">
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin, personalInfo.website].filter(Boolean).map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        {personalInfo.summary && <p className="mt-2 text-slate-700 leading-relaxed">{personalInfo.summary}</p>}
      </header>

      <div className="h-[1px] bg-slate-200" />

      <main className="space-y-4">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              {section.title}
            </h2>

            <div className="space-y-2">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.position}, {exp.company}</span>
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
                    <span><strong>{edu.degree} in {edu.fieldOfStudy}</strong> — {edu.institution}</span>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="text-slate-700">
                  {(section.items as SkillItem[]).map((s) => s.name).join(" • ")}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id}>
                    <span className="font-bold">{proj.title}:</span> {proj.description}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.title || item.name || item.organization}</span>
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
