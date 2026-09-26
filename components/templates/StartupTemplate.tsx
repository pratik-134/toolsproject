import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";
import { Zap, Rocket, Target, TrendingUp } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export const StartupTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#f97316"; // vibrant orange

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-8 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>
            <Rocket className="h-3.5 w-3.5" /> High-Growth Operator
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          {personalInfo.title && (
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{personalInfo.title}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {personalInfo.email && <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-medium">{personalInfo.email}</span>}
          {personalInfo.phone && <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-medium">{personalInfo.phone}</span>}
          {personalInfo.location && <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-medium">{personalInfo.location}</span>}
        </div>
      </header>

      {personalInfo.summary && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3.5 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-0.5">Value Proposition & Impact:</span>
          {personalInfo.summary}
        </div>
      )}

      <main className="space-y-5">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-2.5">
              <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {section.title}
              </h2>
              <div className="flex-1 border-b" />
            </div>

            <div className="space-y-3 text-xs">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="rounded-lg border p-3 bg-white shadow-2xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-sm">{exp.position}</span>
                      <span className="text-slate-500 font-medium">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-slate-600 font-medium italic">{exp.company} • {exp.location}</p>
                    {exp.description && (
                      <div className="mt-1.5 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-slate-700 list-disc ml-4">
                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between border-b pb-2">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-slate-600">{edu.institution} {edu.gpa ? `(GPA ${edu.gpa})` : ""}</p>
                    </div>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-1.5">
                  {(section.items as SkillItem[]).map((s) => (
                    <span key={s.id} className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-xs font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="border rounded p-3">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{proj.title}</span>
                      <span className="text-slate-500">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-700 mt-1">{proj.description}</p>}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between border-b pb-1">
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
