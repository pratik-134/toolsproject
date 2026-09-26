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
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export const TwoColumnTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e3a8a";

  const mainSectionTypes = ["experience", "projects", "awards", "publications"];
  const sidebarSectionTypes = ["education", "skills", "certifications", "languages", "volunteer", "interests", "references", "custom"];

  const mainSections = sections.filter((s) => s.visible && s.items.length > 0 && mainSectionTypes.includes(s.type));
  const sidebarSections = sections.filter((s) => s.visible && s.items.length > 0 && sidebarSectionTypes.includes(s.type));

  return (
    <div
      className="min-h-[1050px] w-full bg-white text-slate-800 shadow-sm print:shadow-none print:min-h-0 flex flex-row"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left Sidebar (1/3 Width) */}
      <aside className="w-1/3 bg-slate-50 border-r border-slate-200 p-6 space-y-6 shrink-0 text-xs">
        {/* Profile Picture */}
        {personalInfo.photo?.url && personalInfo.photo.visible && (
          <div className="flex justify-center">
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              className="w-24 h-24 rounded-full object-cover border-2 shadow-sm"
              style={{ borderColor: accentColor }}
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
            Contact
          </h3>
          <div className="space-y-1.5 text-slate-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5 break-all">
                <Mail className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1.5 break-all">
                <Globe className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1.5 break-all">
                <Linkedin className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "")}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1.5 break-all">
                <Github className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
                <span>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Sections (Education, Skills, Languages, Certifications) */}
        {sidebarSections.map((section) => (
          <div key={section.id} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
              {section.title}
            </h3>

            {/* Education in sidebar */}
            {section.type === "education" &&
              (section.items as EducationItem[]).map((edu) => (
                <div key={edu.id} className="space-y-0.5">
                  <p className="font-bold text-slate-900">{edu.degree}</p>
                  <p className="text-slate-700 italic">{edu.institution}</p>
                  <p className="text-slate-500 text-[11px]">{edu.startDate} – {edu.endDate}</p>
                  {edu.gpa && <p className="text-slate-500 text-[11px]">GPA: {edu.gpa}</p>}
                </div>
              ))}

            {/* Skills in sidebar */}
            {section.type === "skills" && (
              <div className="flex flex-wrap gap-1">
                {(section.items as SkillItem[]).map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-800"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}

            {/* Languages in sidebar */}
            {section.type === "languages" && (
              <div className="space-y-1">
                {(section.items as LanguageItem[]).map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="text-slate-500">{lang.fluency}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications in sidebar */}
            {section.type === "certifications" &&
              (section.items as CertificationItem[]).map((cert) => (
                <div key={cert.id} className="space-y-0.5">
                  <p className="font-medium text-slate-900">{cert.name}</p>
                  <p className="text-slate-500 text-[11px]">{cert.issuer} • {cert.issueDate}</p>
                </div>
              ))}
          </div>
        ))}
      </aside>

      {/* Right Main Column (2/3 Width) */}
      <main className="w-2/3 p-8 space-y-5">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accentColor }}>
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          {personalInfo.title && (
            <p className="text-base font-semibold text-slate-700 mt-0.5">
              {personalInfo.title}
            </p>
          )}
          {personalInfo.summary && (
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {personalInfo.summary}
            </p>
          )}
        </header>

        {mainSections.map((section) => (
          <section key={section.id} className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ color: accentColor }}>
              {section.title}
            </h2>

            {/* Experience */}
            {section.type === "experience" &&
              (section.items as ExperienceItem[]).map((exp) => (
                <div key={exp.id} className="text-xs space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">{exp.position}</span>
                    <span className="text-slate-500 font-medium">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">{exp.company} • {exp.location}</p>
                  {exp.description && (
                    <div
                      className="text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 text-slate-700">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

            {/* Projects */}
            {section.type === "projects" &&
              (section.items as ProjectItem[]).map((proj) => (
                <div key={proj.id} className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{proj.title}</span>
                    <span className="text-slate-500">{proj.startDate} – {proj.endDate}</span>
                  </div>
                  {proj.subtitle && <p className="text-slate-600 italic">{proj.subtitle}</p>}
                  {proj.description && <p className="text-slate-700">{proj.description}</p>}
                </div>
              ))}
          </section>
        ))}
      </main>
    </div>
  );
};
