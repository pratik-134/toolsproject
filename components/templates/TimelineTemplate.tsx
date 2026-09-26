import React from "react";
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
} from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const TimelineTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#3b82f6";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-8 space-y-6 shadow-sm print:shadow-none print:min-h-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-sm font-semibold mt-0.5" style={{ color: accentColor }}>
            {personalInfo.title}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>}
        </div>
        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            {personalInfo.summary}
          </p>
        )}
      </header>

      <main className="space-y-6">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              {section.title}
            </h2>

            {/* Timeline for Experience and Education */}
            {section.type === "experience" || section.type === "education" ? (
              <div className="relative pl-6 border-l-2 space-y-4 text-xs" style={{ borderColor: `${accentColor}30` }}>
                {section.type === "experience" &&
                  (section.items as ExperienceItem[]).map((exp) => (
                    <div key={exp.id} className="relative">
                      {/* Timeline Node */}
                      <div
                        className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 bg-white"
                        style={{ borderColor: accentColor }}
                      />
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-sm">{exp.position}</span>
                        <span className="text-slate-500 font-medium">
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <p className="text-slate-600 italic font-medium">{exp.company} • {exp.location}</p>
                      {exp.description && (
                        <div
                          className="mt-1 text-slate-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: exp.description }}
                        />
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="mt-1 list-disc ml-4 space-y-0.5 text-slate-700">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                {section.type === "education" &&
                  (section.items as EducationItem[]).map((edu) => (
                    <div key={edu.id} className="relative">
                      <div
                        className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 bg-white"
                        style={{ borderColor: accentColor }}
                      />
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                        <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                      </div>
                      <p className="text-slate-600">{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</p>
                    </div>
                  ))}
              </div>
            ) : (
              /* Standard Section presentation */
              <div className="text-xs space-y-2">
                {section.type === "skills" && (
                  <div className="flex flex-wrap gap-1.5">
                    {(section.items as SkillItem[]).map((s) => (
                      <span key={s.id} className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {s.name}
                      </span>
                    ))}
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

                {!["skills", "projects"].includes(section.type) &&
                  section.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="font-bold">{item.title || item.name || item.organization || item.language}</span>
                      <span className="text-slate-500">{item.date || item.issueDate || item.fluency}</span>
                    </div>
                  ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
};
