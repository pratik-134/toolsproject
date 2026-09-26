import React from "react";
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  AwardItem,
  VolunteerItem,
  ReferenceItem,
  CustomItem,
} from "@/lib/schema";

interface TemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e293b";

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  const densityStyles = {
    compact: "space-y-3 py-6 px-8 text-xs",
    comfortable: "space-y-5 py-8 px-10 text-sm",
    spacious: "space-y-7 py-10 px-12 text-base",
  }[theme?.density || "comfortable"];

  return (
    <div
      className={`min-h-[1050px] w-full bg-white text-slate-900 shadow-sm print:shadow-none print:min-h-0 ${densityStyles}`}
      style={{ fontFamily: "'Georgia', 'Cambria', serif" }}
    >
      {/* Centered Formal Header */}
      <header className="text-center border-b-2 pb-4" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl font-bold tracking-wide uppercase text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-sm italic text-slate-600 mt-1 font-serif">
            {personalInfo.title}
          </p>
        )}

        {/* Bullet-separated contact details */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-600">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.location && personalInfo.phone && <span>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>•</span>}
          {personalInfo.email && (
            <a href={`mailto:${personalInfo.email}`} className="hover:underline">
              {personalInfo.email}
            </a>
          )}
          {personalInfo.website && <span>•</span>}
          {personalInfo.website && (
            <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline">
              {personalInfo.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {personalInfo.linkedin && <span>•</span>}
          {personalInfo.linkedin && (
            <a
              href={`https://${personalInfo.linkedin.replace(/^https?:\/\//, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "linkedin.com/in/")}
            </a>
          )}
        </div>

        {personalInfo.summary && (
          <p className="mt-3 text-xs italic leading-relaxed text-slate-700 max-w-2xl mx-auto">
            "{personalInfo.summary}"
          </p>
        )}
      </header>

      {/* Sections */}
      <main className="space-y-4 pt-2">
        {activeSections.map((section) => (
          <section key={section.id} className="break-inside-avoid">
            {/* Formal Section Title */}
            <div className="border-b mb-2 pb-0.5" style={{ borderColor: accentColor }}>
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {section.title}
              </h2>
            </div>

            <div className="space-y-2.5">
              {/* EXPERIENCE */}
              {section.type === "experience" &&
                (section.items as ExperienceItem[]).map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-sm">
                        {exp.company}
                        {exp.location && <span className="font-normal text-slate-600"> — {exp.location}</span>}
                      </span>
                      <span className="text-slate-600 italic text-xs">
                        {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div className="italic text-slate-700 font-medium">{exp.position}</div>
                    {exp.description && (
                      <div
                        className="mt-1 text-slate-700 leading-relaxed font-sans text-xs"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-1 list-disc ml-5 space-y-0.5 text-slate-700 font-sans text-xs">
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
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">
                        {edu.institution}
                        {edu.location && <span className="font-normal text-slate-600"> — {edu.location}</span>}
                      </span>
                      <span className="text-slate-600 italic text-xs">
                        {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                        {edu.current ? "Present" : edu.endDate}
                      </span>
                    </div>
                    <div className="italic text-slate-700">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      {edu.gpa && <span> (GPA: {edu.gpa})</span>}
                    </div>
                    {edu.description && (
                      <p className="mt-0.5 text-slate-600 font-sans text-xs">{edu.description}</p>
                    )}
                  </div>
                ))}

              {/* SKILLS */}
              {section.type === "skills" && (
                <div className="text-xs font-sans text-slate-700 leading-relaxed">
                  <span className="font-semibold font-serif text-slate-900 mr-1.5">Expertise:</span>
                  {(section.items as SkillItem[]).map((s, idx, arr) => (
                    <span key={s.id}>
                      {s.name}
                      {idx < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* PROJECTS */}
              {section.type === "projects" &&
                (section.items as ProjectItem[]).map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      <span className="text-slate-500 italic">
                        {proj.startDate} {proj.startDate && proj.endDate ? "–" : ""} {proj.endDate}
                      </span>
                    </div>
                    {proj.description && (
                      <p className="mt-0.5 text-slate-700 font-sans">{proj.description}</p>
                    )}
                  </div>
                ))}

              {/* OTHER SECTIONS (Certifications, Languages, Awards, etc.) */}
              {section.type === "certifications" &&
                (section.items as CertificationItem[]).map((cert) => (
                  <div key={cert.id} className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900">{cert.name} — <span className="font-normal italic">{cert.issuer}</span></span>
                    <span className="text-slate-500">{cert.issueDate}</span>
                  </div>
                ))}

              {section.type === "languages" && (
                <div className="text-xs font-sans text-slate-700">
                  {(section.items as LanguageItem[]).map((l, i, arr) => (
                    <span key={l.id}>
                      <strong>{l.language}</strong> ({l.fluency}){i < arr.length - 1 ? " • " : ""}
                    </span>
                  ))}
                </div>
              )}

              {["awards", "publications", "volunteer", "references", "custom"].includes(section.type) &&
                section.items.map((item: any) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{item.title || item.name || item.organization}</span>
                      <span className="text-slate-500">{item.date || item.startDate}</span>
                    </div>
                    {item.description && <p className="text-slate-600 font-sans mt-0.5">{item.description}</p>}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
