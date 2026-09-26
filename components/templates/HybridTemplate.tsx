import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export const HybridTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#166534"; // deep forest emerald

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 shadow-sm print:shadow-none print:min-h-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Deep Tone Header */}
      <header className="p-8 text-white" style={{ backgroundColor: accentColor }}>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-sm font-medium text-slate-200 mt-0.5">{personalInfo.title}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
          {personalInfo.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {personalInfo.phone}</span>}
          {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {personalInfo.location}</span>}
          {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> {personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>}
        </div>

        {personalInfo.summary && (
          <p className="mt-3 text-xs text-slate-200 leading-relaxed border-t border-white/20 pt-2">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Main Sections */}
      <main className="p-8 space-y-5 text-xs">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1"
              style={{ color: accentColor }}
            >
              {section.title}
            </h2>

            <div className="space-y-3">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>{exp.position}</span>
                      <span className="font-normal text-xs text-slate-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-slate-600 font-medium italic">{exp.company} • {exp.location}</p>
                    {exp.description && <div className="mt-1 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-4 space-y-0.5 text-slate-700 mt-1">
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
                      <span className="text-slate-500 font-normal">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-slate-700 mt-1">{proj.description}</p>}
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
