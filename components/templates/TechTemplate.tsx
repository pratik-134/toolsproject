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
import { Terminal, Github, Globe, ExternalLink } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export const TechTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#2563eb";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-8 space-y-5 shadow-sm print:shadow-none print:min-h-0 print:p-0"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace, sans-serif" }}
    >
      {/* Dev Header */}
      <header className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
          <Terminal className="h-4 w-4" style={{ color: accentColor }} />
          <span>whoami --verbose</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-mono">
            {personalInfo.fullName || "alex_rivera"}
          </h1>
          {personalInfo.title && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded font-bold"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              &lt;{personalInfo.title} /&gt;
            </span>
          )}
        </div>

        {/* Contact Strip */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.github && (
            <span className="flex items-center gap-1 font-bold">
              <Github className="h-3 w-3" />
              {personalInfo.github.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {personalInfo.website.replace(/^https?:\/\//, "")}
            </span>
          )}
        </div>

        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-slate-700 font-sans border-l-2 pl-3" style={{ borderColor: accentColor }}>
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Main Sections */}
      <main className="space-y-4">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>$</span>
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                {section.title}.log
              </h2>
              <div className="flex-1 border-b border-dashed border-slate-300" />
            </div>

            <div className="space-y-3 font-sans text-xs">
              {/* EXPERIENCE */}
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="group">
                    <div className="flex justify-between items-baseline font-mono text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        {exp.position} <span className="font-normal text-slate-600">@ {exp.company}</span>
                      </span>
                      <span className="text-slate-500 shrink-0">
                        [{exp.startDate} – {exp.current ? "HEAD" : exp.endDate}]
                      </span>
                    </div>
                    {exp.description && (
                      <div
                        className="mt-1 text-slate-700 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-slate-700 list-disc ml-5">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {/* EDUCATION */}
              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="text-slate-500">[{edu.startDate} – {edu.endDate}]</span>
                    </div>
                    <div className="text-slate-600">{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</div>
                  </div>
                ))}

              {/* SKILLS */}
              {section.type === "skills" && (
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {(section.items as SkillItem[]).map((s) => (
                    <span
                      key={s.id}
                      className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-800"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {/* PROJECTS */}
              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="rounded border border-slate-200 p-2.5 bg-slate-50/50">
                    <div className="flex justify-between font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{proj.title}</span>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px]">{proj.startDate} - {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="mt-1 text-slate-700">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1 font-mono text-[10px]">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* CERTIFICATIONS */}
              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((c) => (
                  <div key={c.id} className="flex justify-between font-mono text-xs">
                    <span>{c.name} ({c.issuer})</span>
                    <span className="text-slate-500">{c.issueDate}</span>
                  </div>
                ))}

              {/* LANGUAGES & OTHERS */}
              {section.type === "languages" && (
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {(section.items as LanguageItem[]).map((l) => (
                    <div key={l.id}>
                      <span className="font-bold">{l.language}</span>: {l.fluency}
                    </div>
                  ))}
                </div>
              )}

              {["awards", "publications", "volunteer", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="font-bold">{item.title || item.name || item.organization}</span>
                      <span className="text-slate-500">{item.date || item.startDate}</span>
                    </div>
                    {item.description && <p className="mt-0.5 text-slate-600">{item.description}</p>}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
