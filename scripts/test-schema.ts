import { resumeDataSchema, initialResumeData, Section } from "../lib/schema";

function runVerification() {
  console.log("=== CLEARTRIX RESUME BUILDER FOUNDATION SCHEMA VERIFICATION ===");

  // 1. Validate default fixture
  console.log("1. Validating initial sample resume data fixture...");
  const parseResult = resumeDataSchema.safeParse(initialResumeData);

  if (!parseResult.success) {
    console.error("❌ Schema parsing failed for initialResumeData:");
    console.error(JSON.stringify(parseResult.error.format(), null, 2));
    process.exit(1);
  }
  console.log("✅ initialResumeData passed full Zod validation successfully!");

  // 2. Validate all 12 section types in isolation
  console.log("2. Validating discriminated unions across all 12 section types...");
  const testSections: Section[] = [
    {
      id: "sec-exp",
      type: "experience",
      title: "Experience",
      visible: true,
      order: 0,
      items: [
        {
          id: "exp-1",
          type: "experience",
          company: "Tech Corp",
          position: "Dev",
          location: "Remote",
          startDate: "2020",
          endDate: "2022",
          current: false,
          description: "Built microservices",
          highlights: ["Accomplished X"],
        },
      ],
    },
    {
      id: "sec-edu",
      type: "education",
      title: "Education",
      visible: true,
      order: 1,
      items: [
        {
          id: "edu-1",
          type: "education",
          institution: "State Univ",
          degree: "BS",
          fieldOfStudy: "CS",
          location: "City",
          startDate: "2016",
          endDate: "2020",
          current: false,
          gpa: "3.9",
          honors: "Honors",
          description: "Studies",
        },
      ],
    },
    {
      id: "sec-sk",
      type: "skills",
      title: "Skills",
      visible: true,
      order: 2,
      items: [{ id: "sk-1", type: "skills", name: "TypeScript", level: "expert", rating: 5, category: "Languages" }],
    },
    {
      id: "sec-proj",
      type: "projects",
      title: "Projects",
      visible: true,
      order: 3,
      items: [
        {
          id: "pj-1",
          type: "projects",
          title: "Cleartrix Resume Builder",
          subtitle: "CV Builder",
          link: "https://cleartrix.com",
          startDate: "2024",
          endDate: "Present",
          description: "Free builder",
          technologies: ["Next.js", "Tailwind"],
        },
      ],
    },
    {
      id: "sec-cert",
      type: "certifications",
      title: "Certifications",
      visible: true,
      order: 4,
      items: [
        {
          id: "crt-1",
          type: "certifications",
          name: "AWS SAA",
          issuer: "AWS",
          issueDate: "2023",
          expiryDate: "2026",
          credentialId: "123",
          credentialUrl: "",
        },
      ],
    },
    {
      id: "sec-lang",
      type: "languages",
      title: "Languages",
      visible: true,
      order: 5,
      items: [{ id: "lg-1", type: "languages", language: "English", fluency: "Native" }],
    },
    {
      id: "sec-awd",
      type: "awards",
      title: "Awards",
      visible: true,
      order: 6,
      items: [{ id: "aw-1", type: "awards", title: "Hackathon Winner", issuer: "Org", date: "2023", description: "1st place" }],
    },
    {
      id: "sec-pub",
      type: "publications",
      title: "Publications",
      visible: true,
      order: 7,
      items: [{ id: "pb-1", type: "publications", title: "Paper Title", publisher: "IEEE", date: "2022", url: "", description: "Research" }],
    },
    {
      id: "sec-vol",
      type: "volunteer",
      title: "Volunteering",
      visible: true,
      order: 8,
      items: [{ id: "vl-1", type: "volunteer", organization: "Red Cross", role: "Volunteer", location: "", startDate: "2021", endDate: "2022", current: false, description: "Assisted" }],
    },
    {
      id: "sec-int",
      type: "interests",
      title: "Interests",
      visible: true,
      order: 9,
      items: [{ id: "in-1", type: "interests", name: "Chess", keywords: ["Tactics", "Blitz"] }],
    },
    {
      id: "sec-ref",
      type: "references",
      title: "References",
      visible: true,
      order: 10,
      items: [{ id: "rf-1", type: "references", name: "Jane Doe", relationship: "Manager", company: "Corp", email: "jane@corp.com", phone: "123" }],
    },
    {
      id: "sec-cst",
      type: "custom",
      title: "Custom Section",
      visible: true,
      order: 11,
      items: [{ id: "cs-1", type: "custom", title: "Open Source", subtitle: "Maintainer", date: "2024", description: "Contributions", fields: { commits: "500+" } }],
    },
  ];

  const fullTestResume = {
    ...initialResumeData,
    id: "test-all-sections",
    sections: testSections,
  };

  const allSectionsResult = resumeDataSchema.safeParse(fullTestResume);
  if (!allSectionsResult.success) {
    console.error("❌ Schema parsing failed for all section types:");
    console.error(JSON.stringify(allSectionsResult.error.format(), null, 2));
    process.exit(1);
  }
  console.log("✅ All 12 section types parsed and validated cleanly!");

  // 3. Negative validation test
  console.log("3. Testing invalid section data handling (should fail)...");
  const invalidData = {
    ...initialResumeData,
    sections: [
      {
        id: "invalid-1",
        type: "skills",
        title: "Bad Skills",
        visible: true,
        order: 0,
        items: [
          {
            id: "sk-bad",
            type: "invalid_type", // incorrect type discriminator
            name: "Fail",
          },
        ],
      },
    ],
  };

  const invalidResult = resumeDataSchema.safeParse(invalidData);
  if (invalidResult.success) {
    console.error("❌ Expected validation failure for invalid discriminator, but it passed!");
    process.exit(1);
  }
  console.log("✅ Correctly rejected invalid discriminator as expected!");

  console.log("\n🎉 ALL FOUNDATION SCHEMA CHECKS PASSED!");
}

runVerification();
