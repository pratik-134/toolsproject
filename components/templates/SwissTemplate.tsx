import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const SwissTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#dc2626"; // Swiss red default

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-black p-10 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0 text-xs"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      <header className="border-b-4 border-black pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter uppercase text-black leading-none">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {personalInfo.title && (
              <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: accentColor }}>
                {personalInfo.title}
              </p>
            )}
          </div>
          <div className="text-right text-[11px] font-medium space-y-0.5">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
          </div>
        </div>
        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-black font-normal max-w-2xl border-t border-black pt-2">
            {personalInfo.summary}
          </p>
        )}
      </header>

      <main className="space-y-6">
        {activeSections.map((section) => (
          <div key={section.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 break-inside-avoid">
            {/* 1 Column for Section Title */}
            <div className="md:col-span-1">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-black border-t-2 border-black pt-1">
                {section.title}
              </h2>
            </div>

            {/* 3 Columns for Section Items */}
            <div className="md:col-span-3 border-t-2 border-slate-200 pt-1 space-y-3">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-black">
                      <span>{exp.position}</span>
                      <span className="font-normal text-slate-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="font-medium text-slate-700">{exp.company} / {exp.location}</p>
                    {exp.description && <div className="mt-1 leading-relaxed text-slate-800" dangerouslySetInnerHTML={{ __html: exp.description }} />}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-square ml-4 space-y-0.5 text-slate-800 mt-1">
                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <span className="font-bold">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-slate-600">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-2">
                  {(section.items as SkillItem[]).map((s) => (
                    <span key={s.id} className="border border-black px-2 py-0.5 font-bold text-[11px]">
                      {s.name}
                    </span>
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
          </div>
        ))}
      </main>
    </div>
  );
};
