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
import { Sparkles, Mail, Phone, MapPin, Globe } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#ec4899";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 p-8 space-y-6 shadow-sm print:shadow-none print:min-h-0"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Creative Header */}
      <header className="rounded-2xl p-6 bg-slate-50 border relative overflow-hidden">
        <div
          className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-10 blur-xl"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Portfolio & Resume
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {personalInfo.fullName || "Your Name"}
            </h1>
            {personalInfo.title && (
              <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>
                {personalInfo.title}
              </p>
            )}
          </div>

          {/* Contact Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            {personalInfo.email && (
              <span className="rounded-full bg-white border px-3 py-1 text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <Mail className="h-3 w-3" style={{ color: accentColor }} />
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="rounded-full bg-white border px-3 py-1 text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <Phone className="h-3 w-3" style={{ color: accentColor }} />
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="rounded-full bg-white border px-3 py-1 text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <MapPin className="h-3 w-3" style={{ color: accentColor }} />
                {personalInfo.location}
              </span>
            )}
          </div>
        </div>

        {personalInfo.summary && (
          <p className="mt-4 text-xs text-slate-600 leading-relaxed font-sans border-t pt-3">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Dynamic Sections */}
      <main className="space-y-6">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-sm rotate-45" style={{ backgroundColor: accentColor }} />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                {section.title}
              </h2>
              <div className="flex-1 h-[1px] bg-slate-100" />
            </div>

            <div className="space-y-3 font-sans text-xs">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="rounded-xl border p-4 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-sm">{exp.position}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium">{exp.company} • {exp.location}</p>
                    {exp.description && (
                      <div
                        className="mt-2 text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-2 list-disc ml-4 space-y-1 text-slate-700">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between items-center rounded-lg border p-3">
                    <div>
                      <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-slate-500">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <span className="text-slate-400">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-2">
                  {(section.items as SkillItem[]).map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="rounded-xl border p-4 bg-slate-50/50">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{proj.title}</span>
                      <span className="text-slate-400 font-normal">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.subtitle && <p className="text-slate-500 text-xs italic">{proj.subtitle}</p>}
                    {proj.description && <p className="mt-1 text-slate-700">{proj.description}</p>}
                  </div>
                ))}

              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((c) => (
                  <div key={c.id} className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-slate-800">{c.name} ({c.issuer})</span>
                    <span className="text-slate-400">{c.issueDate}</span>
                  </div>
                ))}

              {section.type === "languages" && (
                <div className="flex flex-wrap gap-3">
                  {(section.items as LanguageItem[]).map((l) => (
                    <span key={l.id} className="bg-slate-100 rounded-md px-2.5 py-1 text-slate-700">
                      <strong>{l.language}</strong>: {l.fluency}
                    </span>
                  ))}
                </div>
              )}

              {["awards", "publications", "volunteer", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="border-l-2 pl-3" style={{ borderColor: accentColor }}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.title || item.name || item.organization}</span>
                      <span className="text-slate-400 font-normal">{item.date || item.startDate}</span>
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
