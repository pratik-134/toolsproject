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

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e293b";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 shadow-sm print:shadow-none print:min-h-0"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* Executive Header Banner */}
      <header
        className="p-8 text-white"
        style={{ backgroundColor: accentColor }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider uppercase font-serif">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {personalInfo.title && (
              <p className="text-base font-light tracking-wide text-slate-200 mt-1 uppercase">
                {personalInfo.title}
              </p>
            )}
          </div>
          <div className="text-xs space-y-1 text-slate-300 font-sans text-right md:border-l md:border-slate-500/50 md:pl-4">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.linkedin && <p>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</p>}
          </div>
        </div>

        {personalInfo.summary && (
          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-slate-200 leading-relaxed font-sans max-w-3xl">
            <span className="font-bold text-white uppercase tracking-wider block mb-1">
              Executive Profile
            </span>
            {personalInfo.summary}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-6">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <div className="border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
              <h2
                className="text-xs font-bold uppercase tracking-widest font-sans"
                style={{ color: accentColor }}
              >
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-serif">
                      <span className="font-bold text-sm text-slate-900 uppercase">
                        {exp.position}
                      </span>
                      <span className="text-slate-600 font-sans text-xs">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div className="font-sans font-semibold text-slate-700 italic">
                      {exp.company} {exp.location ? `— ${exp.location}` : ""}
                    </div>
                    {exp.description && (
                      <div
                        className="mt-1.5 text-slate-700 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-slate-700 font-sans list-disc ml-5">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="text-xs flex justify-between font-sans">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-slate-600 italic">{edu.institution} {edu.location ? `— ${edu.location}` : ""}</p>
                    </div>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-2 font-sans text-xs">
                  {(section.items as SkillItem[]).map((s) => (
                    <span
                      key={s.id}
                      className="border border-slate-300 px-2 py-0.5 rounded text-slate-800 font-medium"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="text-xs font-sans">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{proj.title}</span>
                      <span className="text-slate-500 font-normal">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-700 mt-0.5">{proj.description}</p>}
                  </div>
                ))}

              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((c) => (
                  <div key={c.id} className="flex justify-between font-sans text-xs">
                    <span className="font-medium text-slate-900">{c.name} — {c.issuer}</span>
                    <span className="text-slate-500">{c.issueDate}</span>
                  </div>
                ))}

              {section.type === "languages" && (
                <div className="flex flex-wrap gap-4 font-sans text-xs">
                  {(section.items as LanguageItem[]).map((l) => (
                    <span key={l.id}><strong>{l.language}</strong>: {l.fluency}</span>
                  ))}
                </div>
              )}

              {["awards", "publications", "volunteer", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="text-xs font-sans">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.title || item.name || item.organization}</span>
                      <span className="text-slate-500 font-normal">{item.date || item.startDate}</span>
                    </div>
                    {item.description && <p className="text-slate-600 mt-0.5">{item.description}</p>}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
