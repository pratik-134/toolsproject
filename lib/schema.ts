import { z } from "zod";

// ==========================================
// 1. Personal Info Schema
// ==========================================
export const photoConfigSchema = z.object({
  url: z.string().default(""),
  shape: z.enum(["circle", "square", "rounded"]).default("circle"),
  size: z.number().min(40).max(200).default(96), // size in px
  visible: z.boolean().default(true),
});

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").default(""),
  title: z.string().default(""),
  email: z.string().email("Invalid email address").or(z.literal("")).default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().url("Invalid URL").or(z.literal("")).default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  photo: photoConfigSchema.optional().default({ url: "", shape: "circle", size: 96, visible: true }),
  summary: z.string().default(""),
});

export type PhotoConfig = z.infer<typeof photoConfigSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// ==========================================
// 2. Section Item Schemas (Discriminated Union)
// ==========================================

export const experienceItemSchema = z.object({
  id: z.string(),
  type: z.literal("experience").default("experience"),
  company: z.string().default(""),
  position: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""), // rich-text HTML string or markdown bullets
  highlights: z.array(z.string()).default([]),
});

export const educationItemSchema = z.object({
  id: z.string(),
  type: z.literal("education").default("education"),
  institution: z.string().default(""),
  degree: z.string().default(""),
  fieldOfStudy: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  gpa: z.string().default(""),
  honors: z.string().default(""),
  description: z.string().default(""),
});

export const skillItemSchema = z.object({
  id: z.string(),
  type: z.literal("skills").default("skills"),
  name: z.string().default(""),
  level: z.enum(["beginner", "intermediate", "advanced", "expert", "none"]).default("none"),
  rating: z.number().min(0).max(5).default(0), // 1-5 rating or 0 if disabled
  category: z.string().default(""), // e.g. Frontend, Backend, Tools
});

export const projectItemSchema = z.object({
  id: z.string(),
  type: z.literal("projects").default("projects"),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  link: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  type: z.literal("certifications").default("certifications"),
  name: z.string().default(""),
  issuer: z.string().default(""),
  issueDate: z.string().default(""),
  expiryDate: z.string().default(""),
  credentialId: z.string().default(""),
  credentialUrl: z.string().default(""),
});

export const languageItemSchema = z.object({
  id: z.string(),
  type: z.literal("languages").default("languages"),
  language: z.string().default(""),
  fluency: z.enum(["Native", "Fluent", "Professional", "Intermediate", "Elementary"]).default("Fluent"),
});

export const awardItemSchema = z.object({
  id: z.string(),
  type: z.literal("awards").default("awards"),
  title: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  description: z.string().default(""),
});

export const publicationItemSchema = z.object({
  id: z.string(),
  type: z.literal("publications").default("publications"),
  title: z.string().default(""),
  publisher: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
  description: z.string().default(""),
});

export const volunteerItemSchema = z.object({
  id: z.string(),
  type: z.literal("volunteer").default("volunteer"),
  organization: z.string().default(""),
  role: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""),
});

export const interestItemSchema = z.object({
  id: z.string(),
  type: z.literal("interests").default("interests"),
  name: z.string().default(""),
  keywords: z.array(z.string()).default([]),
});

export const referenceItemSchema = z.object({
  id: z.string(),
  type: z.literal("references").default("references"),
  name: z.string().default(""),
  relationship: z.string().default(""),
  company: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
});

export const customItemSchema = z.object({
  id: z.string(),
  type: z.literal("custom").default("custom"),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  date: z.string().default(""),
  description: z.string().default(""),
  fields: z.record(z.string()).default({}),
});

export const sectionItemSchema = z.discriminatedUnion("type", [
  experienceItemSchema,
  educationItemSchema,
  skillItemSchema,
  projectItemSchema,
  certificationItemSchema,
  languageItemSchema,
  awardItemSchema,
  publicationItemSchema,
  volunteerItemSchema,
  interestItemSchema,
  referenceItemSchema,
  customItemSchema,
]);

export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type AwardItem = z.infer<typeof awardItemSchema>;
export type PublicationItem = z.infer<typeof publicationItemSchema>;
export type VolunteerItem = z.infer<typeof volunteerItemSchema>;
export type InterestItem = z.infer<typeof interestItemSchema>;
export type ReferenceItem = z.infer<typeof referenceItemSchema>;
export type CustomItem = z.infer<typeof customItemSchema>;
export type SectionItem = z.infer<typeof sectionItemSchema>;

// ==========================================
// 3. Section Schema (Strongly Typed per Type)
// ==========================================
export const sectionTypeSchema = z.enum([
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
  "publications",
  "volunteer",
  "interests",
  "references",
  "custom",
]);

export type SectionType = z.infer<typeof sectionTypeSchema>;

export const baseSectionSchema = z.object({
  id: z.string(),
  type: sectionTypeSchema,
  title: z.string(),
  visible: z.boolean().default(true),
  locked: z.boolean().optional(),
  order: z.number().default(0),
  items: z.array(z.any()).default([]),
});

export const experienceSectionSchema = baseSectionSchema.extend({
  type: z.literal("experience"),
  items: z.array(experienceItemSchema),
});

export const educationSectionSchema = baseSectionSchema.extend({
  type: z.literal("education"),
  items: z.array(educationItemSchema),
});

export const skillsSectionSchema = baseSectionSchema.extend({
  type: z.literal("skills"),
  items: z.array(skillItemSchema),
});

export const projectsSectionSchema = baseSectionSchema.extend({
  type: z.literal("projects"),
  items: z.array(projectItemSchema),
});

export const certificationsSectionSchema = baseSectionSchema.extend({
  type: z.literal("certifications"),
  items: z.array(certificationItemSchema),
});

export const languagesSectionSchema = baseSectionSchema.extend({
  type: z.literal("languages"),
  items: z.array(languageItemSchema),
});

export const awardsSectionSchema = baseSectionSchema.extend({
  type: z.literal("awards"),
  items: z.array(awardItemSchema),
});

export const publicationsSectionSchema = baseSectionSchema.extend({
  type: z.literal("publications"),
  items: z.array(publicationItemSchema),
});

export const volunteerSectionSchema = baseSectionSchema.extend({
  type: z.literal("volunteer"),
  items: z.array(volunteerItemSchema),
});

export const interestsSectionSchema = baseSectionSchema.extend({
  type: z.literal("interests"),
  items: z.array(interestItemSchema),
});

export const referencesSectionSchema = baseSectionSchema.extend({
  type: z.literal("references"),
  items: z.array(referenceItemSchema),
});

export const customSectionSchema = baseSectionSchema.extend({
  type: z.literal("custom"),
  items: z.array(customItemSchema),
});

export const sectionSchema = z.discriminatedUnion("type", [
  experienceSectionSchema,
  educationSectionSchema,
  skillsSectionSchema,
  projectsSectionSchema,
  certificationsSectionSchema,
  languagesSectionSchema,
  awardsSectionSchema,
  publicationsSectionSchema,
  volunteerSectionSchema,
  interestsSectionSchema,
  referencesSectionSchema,
  customSectionSchema,
]);

export type Section = z.infer<typeof sectionSchema>;

// ==========================================
// 4. Theme & Appearance Schema
// ==========================================
export const fontPairSchema = z.enum([
  "inter-roboto",
  "merriweather-sans",
  "playfair-source",
  "lora-opensans",
  "fira-jetbrains",
  "poppins-lato",
]);

export const densitySchema = z.enum(["compact", "comfortable", "spacious"]);

export const themeConfigSchema = z.object({
  templateId: z.string().default("modern"),
  accentColor: z.string().default("#2563EB"), // Default Qwertygen Brand Blue
  fontPair: fontPairSchema.default("inter-roboto"),
  density: densitySchema.default("comfortable"),
  columns: z.union([z.literal(1), z.literal(2)]).default(1),
  marginSize: z.enum(["narrow", "normal", "wide"]).default("normal"),
  showIcons: z.boolean().default(true),
  showGridLines: z.boolean().default(false),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

// ==========================================
// 5. Resume Meta Schema
// ==========================================
export const resumeMetaSchema = z.object({
  language: z.string().default("en"),
  lastEditedAt: z.string().default(() => new Date().toISOString()),
  atsScore: z.number().min(0).max(100).optional(),
  targetJobTitle: z.string().optional(),
  targetJobKeywords: z.array(z.string()).default([]),
  atsSafeMode: z.boolean().default(false),
  completenessScore: z.number().min(0).max(100).default(0),
});

export type ResumeMeta = z.infer<typeof resumeMetaSchema>;

// ==========================================
// 6. Root ResumeData Schema
// ==========================================
export const resumeDataSchema = z.object({
  id: z.string().default(() => (typeof crypto !== "undefined" ? crypto.randomUUID() : "default-id")),
  title: z.string().default("Untitled Resume"),
  personalInfo: personalInfoSchema,
  sections: z.array(sectionSchema).default([]),
  theme: themeConfigSchema.default({
    templateId: "modern",
    accentColor: "#2563eb",
    fontPair: "inter-roboto",
    density: "comfortable",
    columns: 1,
    marginSize: "normal",
    showIcons: true,
    showGridLines: false,
  }),
  meta: resumeMetaSchema.default({
    language: "en",
    lastEditedAt: new Date().toISOString(),
    atsSafeMode: false,
    completenessScore: 85,
    targetJobKeywords: [],
  }),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

// ==========================================
// 7. Initial / Sample Resume Data Fixture
// ==========================================
export const initialResumeData: ResumeData = {
  id: "qwertygen-sample-01",
  title: "Senior Full Stack Engineer Resume",
  personalInfo: {
    fullName: "Alex Rivera",
    title: "Senior Full Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 382-9102",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
    linkedin: "linkedin.com/in/alexrivera-dev",
    github: "github.com/alexrivera",
    photo: {
      url: "",
      shape: "circle",
      size: 96,
      visible: true,
    },
    summary:
      "Results-oriented Senior Full Stack Engineer with 7+ years of experience designing, scaling, and maintaining mission-critical web applications. Spearheaded cloud migrations, optimized API latency by 42%, and mentored junior engineers across high-velocity teams.",
  },
  sections: [
    {
      id: "sec-exp-1",
      type: "experience",
      title: "Work Experience",
      visible: true,
      order: 0,
      items: [
        {
          id: "exp-1",
          type: "experience",
          company: "Acme Cloud Technologies",
          position: "Lead Software Engineer",
          location: "San Francisco, CA",
          startDate: "2021-03",
          endDate: "Present",
          current: true,
          description:
            "<p>Architected and led the development of a real-time event streaming pipeline processing 15M+ daily requests with 99.99% uptime.</p>",
          highlights: [
            "Reduced end-to-end P99 API latency by 42% through Redis caching and PostgreSQL query indexing.",
            "Spearheaded the migration of monolithic microservices to Kubernetes, lowering cloud compute costs by $120k annually.",
            "Mentored an engineering squad of 8 engineers and introduced automated CI/CD test gates.",
          ],
        },
        {
          id: "exp-2",
          type: "experience",
          company: "Vanguard Digital Lab",
          position: "Senior Frontend Engineer",
          location: "New York, NY",
          startDate: "2018-06",
          endDate: "2021-02",
          current: false,
          description:
            "<p>Delivered enterprise design system components and customer-facing dashboard experiences used by 250k+ active SaaS subscribers.</p>",
          highlights: [
            "Rebuilt core data visualizer in Next.js & WebGL, improving Core Web Vitals LCP from 3.8s to 1.1s.",
            "Authored 40+ reusable React/TypeScript component primitives with full WCAG 2.1 AA accessibility compliance.",
          ],
        },
      ],
    },
    {
      id: "sec-edu-1",
      type: "education",
      title: "Education",
      visible: true,
      order: 1,
      items: [
        {
          id: "edu-1",
          type: "education",
          institution: "University of California, Berkeley",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science & Engineering",
          location: "Berkeley, CA",
          startDate: "2014-08",
          endDate: "2018-05",
          current: false,
          gpa: "3.85 / 4.0",
          honors: "Magna Cum Laude, Dean's Honors List",
          description: "Focus on Distributed Systems, Algorithms, and Human-Computer Interaction.",
        },
      ],
    },
    {
      id: "sec-skills-1",
      type: "skills",
      title: "Skills & Proficiencies",
      visible: true,
      order: 2,
      items: [
        { id: "sk-1", type: "skills", name: "TypeScript / JavaScript", level: "expert", rating: 5, category: "Languages" },
        { id: "sk-2", type: "skills", name: "React & Next.js", level: "expert", rating: 5, category: "Frontend" },
        { id: "sk-3", type: "skills", name: "Node.js & Go", level: "advanced", rating: 4, category: "Backend" },
        { id: "sk-4", type: "skills", name: "PostgreSQL & Redis", level: "advanced", rating: 4, category: "Databases" },
        { id: "sk-5", type: "skills", name: "Docker & Kubernetes", level: "intermediate", rating: 3, category: "DevOps" },
        { id: "sk-6", type: "skills", name: "System Architecture", level: "expert", rating: 5, category: "Architecture" },
      ],
    },
    {
      id: "sec-proj-1",
      type: "projects",
      title: "Key Projects",
      visible: true,
      order: 3,
      items: [
        {
          id: "proj-1",
          type: "projects",
          title: "HyperScale DB Cache",
          subtitle: "Open-source distributed LRU cache proxy",
          link: "https://github.com/alexrivera/hyperscale-cache",
          startDate: "2023-01",
          endDate: "2023-08",
          description: "Engineered a low-overhead in-memory cache proxy achieving sub-millisecond lookups for relational databases.",
          technologies: ["Go", "Redis Protocol", "Docker", "Prometheus"],
        },
      ],
    },
    {
      id: "sec-cert-1",
      type: "certifications",
      title: "Certifications",
      visible: true,
      order: 4,
      items: [
        {
          id: "cert-1",
          type: "certifications",
          name: "AWS Certified Solutions Architect – Associate",
          issuer: "Amazon Web Services",
          issueDate: "2022-10",
          expiryDate: "2025-10",
          credentialId: "AWS-PSA-83921",
          credentialUrl: "https://aws.amazon.com/verification",
        },
      ],
    },
    {
      id: "sec-lang-1",
      type: "languages",
      title: "Languages",
      visible: true,
      order: 5,
      items: [
        { id: "lang-1", type: "languages", language: "English", fluency: "Native" },
        { id: "lang-2", type: "languages", language: "Spanish", fluency: "Professional" },
      ],
    },
  ],
  theme: {
    templateId: "modern",
    accentColor: "#2563EB",
    fontPair: "inter-roboto",
    density: "comfortable",
    columns: 1,
    marginSize: "normal",
    showIcons: true,
    showGridLines: false,
  },
  meta: {
    language: "en",
    lastEditedAt: new Date().toISOString(),
    atsScore: 94,
    atsSafeMode: false,
    completenessScore: 92,
    targetJobTitle: "Lead Full Stack Engineer",
    targetJobKeywords: ["React", "TypeScript", "Node.js", "Kubernetes", "PostgreSQL", "System Design"],
  },
};
