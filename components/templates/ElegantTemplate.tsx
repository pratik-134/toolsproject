import React from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const ElegantTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#78350f"; // warm amber/bronze

  const activeSections = [...sections].filter((s) => s.visible && s.items.length > 0).sort((a, b) => a.order - b.order);

  return (
    <div
      className="min-h-[1050px] w-full bg-[#fafaf9] text-stone-800 p-10 space-y-6 shadow-sm print:shadow-none print:min-h-0 print:p-0"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <header className="text-center border-b border-stone-300 pb-5">
        <h1 className="text-3xl tracking-widest font-normal text-stone-900 uppercase">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-xs italic tracking-widest text-stone-600 mt-1 uppercase">
            {personalInfo.title}
          </p>
        )}
        <div className="mt-3 flex justify-center gap-4 text-xs text-stone-500 font-sans tracking-wide">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {personalInfo.summary && (
          <p className="mt-3 text-xs italic text-stone-600 max-w-xl mx-auto font-serif leading-relaxed">
            "{personalInfo.summary}"
          </p>
        )}
      </header>

      <main className="space-y-5">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            <h2
              className="text-center text-xs font-semibold uppercase tracking-[0.25em] mb-2 pb-1 border-b border-stone-200"
              style={{ color: accentColor }}
            >
              {section.title}
            </h2>

            <div className="space-y-3 font-sans text-xs">
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-serif font-bold text-stone-900 text-sm">
                      <span>{exp.position}</span>
                      <span className="font-sans font-normal text-xs text-stone-500">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="italic text-stone-600 font-serif">{exp.company} — {exp.location}</p>
                    {exp.description && (
                      <div className="mt-1 text-stone-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-5 mt-1 space-y-0.5 text-stone-700">
                        {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                (section.items as EducationItem[]).map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <span className="font-serif font-bold text-stone-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <p className="text-stone-600 italic font-serif">{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <span className="text-stone-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}

              {section.type === "skills" && (
                <div className="flex flex-wrap justify-center gap-3 text-stone-700">
                  {(section.items as SkillItem[]).map((s) => (
                    <span key={s.id} className="border-b border-stone-300 pb-0.5 italic font-serif">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between font-serif font-bold text-stone-900">
                      <span>{proj.title}</span>
                      <span className="font-sans text-stone-500 text-xs">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    {proj.description && <p className="text-stone-600 mt-0.5">{proj.description}</p>}
                  </div>
                ))}

              {!["experience", "education", "skills", "projects"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="font-serif font-bold text-stone-900">{item.title || item.name || item.organization}</span>
                    <span className="text-stone-500">{item.date || item.issueDate}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
