import React from "react";
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  PublicationItem,
} from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const AcademicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e293b";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-900 p-10 space-y-5 shadow-sm print:shadow-none print:min-h-0 text-xs leading-relaxed"
      style={{ fontFamily: "'Cambria', 'Georgia', serif" }}
    >
      {/* Curriculum Vitae Header */}
      <header className="border-b-2 border-slate-900 pb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-950 font-serif">
          {personalInfo.fullName || "Curriculum Vitae"}
        </h1>
        {personalInfo.title && (
          <p className="text-sm italic text-slate-700 mt-0.5">
            {personalInfo.title}
          </p>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-x-3 text-xs text-slate-600 font-sans">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.email && <span>Email: {personalInfo.email}</span>}
          {personalInfo.phone && <span>Tel: {personalInfo.phone}</span>}
          {personalInfo.website && <span>Web: {personalInfo.website.replace(/^https?:\/\//, "")}</span>}
        </div>
      </header>

      {/* Sections */}
      <main className="space-y-4">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-widest border-b pb-0.5 mb-2 font-serif"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              {section.title}
            </h2>

            <div className="space-y-2.5">
              {/* Education First for Academic CVs */}
              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-slate-950">{edu.degree} in {edu.fieldOfStudy}</span>,{" "}
                      <span className="italic">{edu.institution}</span>
                      {edu.honors && <p className="text-slate-600 text-[11px] font-sans">Honors: {edu.honors}</p>}
                    </div>
                    <span className="text-slate-600 font-sans text-[11px] shrink-0">{edu.endDate || edu.startDate}</span>
                  </div>
                ))}

              {/* Experience / Appointments */}
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{exp.position}</span>
                      <span className="text-slate-600 font-sans text-[11px]">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="italic text-slate-700">{exp.company}, {exp.location}</p>
                    {exp.description && (
                      <div
                        className="mt-0.5 text-slate-700 font-sans leading-normal"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                  </div>
                ))}

              {/* Publications */}
              {section.type === "publications" &&
                (section.items as PublicationItem[]).map((pub) => (
                  <div key={pub.id} className="pl-4 -indent-4">
                    <span className="font-bold">"{pub.title}"</span>.{" "}
                    <span className="italic">{pub.publisher}</span> ({pub.date}).
                    {pub.url && <span className="font-sans text-[11px] text-blue-700 block ml-4">{pub.url}</span>}
                  </div>
                ))}

              {/* Skills / Methods */}
              {section.type === "skills" && (
                <div className="font-sans text-[11px] text-slate-700">
                  <span className="font-bold font-serif text-slate-900 mr-2">Research & Methodologies:</span>
                  {(section.items as SkillItem[]).map((s) => s.name).join(", ")}
                </div>
              )}

              {/* Other sections */}
              {["projects", "awards", "certifications", "volunteer", "languages", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="font-bold">{item.title || item.name || item.organization}</span>
                      {item.description && <span className="text-slate-600"> — {item.description}</span>}
                    </div>
                    <span className="text-slate-500 font-sans text-[11px] shrink-0">{item.date || item.issueDate}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
