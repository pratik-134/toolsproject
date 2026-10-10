import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ExternalHyperlink,
} from "docx";
import {
  ResumeData,
  Section,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  AwardItem,
  PublicationItem,
  VolunteerItem,
  InterestItem,
  ReferenceItem,
  CustomItem,
} from "../schema";
import { ComputedResumeLayout, getComputedResumeLayout } from "../resume-layout";
import { DocxTemplateOptions, SectionRenderContext } from "./types";

/**
 * Cleans hex color for OOXML: removes '#' and ensures valid 6-char hex.
 */
export function cleanHexColor(hex?: string): string {
  if (!hex) return "0F172A";
  const clean = hex.replace("#", "").trim();
  if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return clean.toUpperCase();
  }
  return "0F172A";
}

/**
 * Converts points to Word twips (1 pt = 20 twips).
 */
export function ptToTwip(pt: number): number {
  return Math.round(pt * 20);
}

/**
 * Maps font pairings to widely-available system fonts supported across
 * Microsoft Word, Google Docs, Apple Pages, and LibreOffice.
 */
export function mapDocxFont(fontName?: string): string {
  return "Manrope";
}

/**
 * Creates standard A4 page layout properties in twips.
 */
export function buildPageProperties(layout: ComputedResumeLayout) {
  return {
    page: {
      size: {
        width: 11906, // A4 width (210mm in twips)
        height: 16838, // A4 height (297mm in twips)
      },
      margin: {
        top: ptToTwip(layout.margins.topPt),
        bottom: ptToTwip(layout.margins.bottomPt),
        left: ptToTwip(layout.margins.horizontalPt),
        right: ptToTwip(layout.margins.horizontalPt),
      },
    },
  };
}

/**
 * Builds the Personal Information header paragraphs.
 */
export function buildDocxHeader(ctx: SectionRenderContext): Paragraph[] {
  const { data, layout, options, accentHex, fontFamily, headingFontFamily } = ctx;
  const { personalInfo } = data;
  const align =
    options.headerAlign === "center"
      ? AlignmentType.CENTER
      : options.headerAlign === "right"
      ? AlignmentType.RIGHT
      : AlignmentType.LEFT;

  const paragraphs: Paragraph[] = [];

  // 1. Candidate Full Name
  paragraphs.push(
    new Paragraph({
      alignment: align,
      spacing: {
        before: 0,
        after: ptToTwip(2),
      },
      children: [
        new TextRun({
          text: personalInfo.fullName || "Candidate Name",
          font: headingFontFamily,
          bold: true,
          size: Math.round(layout.density.fontSize.namePt * 2),
          color: options.headerVariant === "banner" ? "FFFFFF" : accentHex,
        }),
      ],
    })
  );

  // 2. Job Title
  if (personalInfo.title) {
    paragraphs.push(
      new Paragraph({
        alignment: align,
        spacing: {
          before: 0,
          after: ptToTwip(4),
        },
        children: [
          new TextRun({
            text: personalInfo.title,
            font: fontFamily,
            bold: true,
            size: Math.round(layout.density.fontSize.titlePt * 2),
            color: "475569",
          }),
        ],
      })
    );
  }

  // 3. Contact Line
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.linkedin) {
    contactParts.push(personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, ""));
  }
  if (personalInfo.github) {
    contactParts.push(personalInfo.github.replace(/^https?:\/\/(www\.)?/, ""));
  }
  if (personalInfo.website) {
    contactParts.push(personalInfo.website.replace(/^https?:\/\/(www\.)?/, ""));
  }

  if (contactParts.length > 0) {
    const runs: TextRun[] = [];
    contactParts.forEach((part, idx) => {
      runs.push(
        new TextRun({
          text: part,
          font: fontFamily,
          size: Math.round(layout.density.fontSize.captionPt * 2),
          color: "64748B",
        })
      );
      if (idx < contactParts.length - 1) {
        runs.push(
          new TextRun({
            text: "  •  ",
            font: fontFamily,
            size: Math.round(layout.density.fontSize.captionPt * 2),
            color: "94A3B8",
            bold: true,
          })
        );
      }
    });

    paragraphs.push(
      new Paragraph({
        alignment: align,
        spacing: {
          before: 0,
          after: ptToTwip(layout.density.headerMarginBottomPt),
        },
        border:
          options.headerVariant === "minimal"
            ? undefined
            : {
                bottom: {
                  color: "E2E8F0",
                  style: BorderStyle.SINGLE,
                  size: 6,
                  space: 6,
                },
              },
        children: runs,
      })
    );
  }

  // 4. Professional Summary
  if (personalInfo.summary) {
    paragraphs.push(
      new Paragraph({
        alignment: options.headerAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
          before: ptToTwip(2),
          after: ptToTwip(layout.density.sectionSpacingPt),
          line: Math.round(layout.density.lineHeight * 240),
        },
        children: [
          new TextRun({
            text: personalInfo.summary,
            font: fontFamily,
            size: Math.round(layout.density.fontSize.bodyPt * 2),
            color: "334155",
          }),
        ],
      })
    );
  }

  return paragraphs;
}

/**
 * Builds a styled section heading paragraph with configurable bottom border.
 */
export function buildSectionHeading(title: string, ctx: SectionRenderContext): Paragraph {
  const { layout, options, accentHex, headingFontFamily } = ctx;
  const isCaps = options.sectionHeadingStyle !== "clean";

  let bottomBorder: any = undefined;
  if (options.sectionHeadingStyle === "double-line") {
    bottomBorder = {
      color: accentHex,
      style: BorderStyle.DOUBLE,
      size: 12,
      space: 3,
    };
  } else if (options.sectionHeadingStyle === "thick-line") {
    bottomBorder = {
      color: accentHex,
      style: BorderStyle.SINGLE,
      size: 18,
      space: 3,
    };
  } else if (options.sectionHeadingStyle !== "clean") {
    bottomBorder = {
      color: accentHex,
      style: BorderStyle.SINGLE,
      size: 10,
      space: 3,
    };
  }

  return new Paragraph({
    spacing: {
      before: ptToTwip(layout.density.sectionSpacingPt),
      after: ptToTwip(layout.density.itemSpacingPt),
    },
    border: bottomBorder ? { bottom: bottomBorder } : undefined,
    children: [
      new TextRun({
        text: isCaps ? title.toUpperCase() : title,
        font: headingFontFamily,
        bold: true,
        size: Math.round(layout.density.fontSize.sectionHeadingPt * 2),
        color: accentHex,
      }),
    ],
  });
}

/**
 * Builds Experience section paragraphs.
 */
export function buildExperienceSection(items: ExperienceItem[], ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily, headingFontFamily } = ctx;
  const paragraphs: Paragraph[] = [];

  for (const item of items) {
    // Header Line: Position & Company (Left) + Dates (Right via spacing)
    const dateStr = item.startDate ? `${item.startDate} – ${item.current ? "Present" : item.endDate}` : "";
    const locStr = item.location ? ` | ${item.location}` : "";

    paragraphs.push(
      new Paragraph({
        spacing: {
          before: ptToTwip(layout.density.itemSpacingPt),
          after: ptToTwip(1),
        },
        children: [
          new TextRun({
            text: item.position || "Role",
            font: headingFontFamily,
            bold: true,
            size: Math.round(layout.density.fontSize.itemTitlePt * 2),
            color: "0F172A",
          }),
          new TextRun({
            text: `  •  ${item.company || "Organization"}${locStr}`,
            font: fontFamily,
            bold: true,
            size: Math.round(layout.density.fontSize.itemSubtitlePt * 2),
            color: "475569",
          }),
          ...(dateStr
            ? [
                new TextRun({
                  text: `   (${dateStr})`,
                  font: fontFamily,
                  size: Math.round(layout.density.fontSize.captionPt * 2),
                  color: "64748B",
                  italics: true,
                }),
              ]
            : []),
        ],
      })
    );

    // Freeform description text
    if (item.description && !item.highlights?.length) {
      paragraphs.push(
        new Paragraph({
          spacing: {
            before: ptToTwip(1),
            after: ptToTwip(layout.density.bulletSpacingPt),
            line: Math.round(layout.density.lineHeight * 240),
          },
          children: [
            new TextRun({
              text: item.description,
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "334155",
            }),
          ],
        })
      );
    }

    // Native Word bullet points
    if (item.highlights && item.highlights.length > 0) {
      for (const hl of item.highlights) {
        if (!hl.trim()) continue;
        paragraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: {
              before: ptToTwip(layout.density.bulletSpacingPt),
              after: ptToTwip(layout.density.bulletSpacingPt),
              line: Math.round(layout.density.lineHeight * 240),
            },
            children: [
              new TextRun({
                text: hl.replace(/^[•\-*]\s*/, ""),
                font: fontFamily,
                size: Math.round(layout.density.fontSize.bodyPt * 2),
                color: "334155",
              }),
            ],
          })
        );
      }
    }
  }

  return paragraphs;
}

/**
 * Builds Education section paragraphs.
 */
export function buildEducationSection(items: EducationItem[], ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily, headingFontFamily } = ctx;
  const paragraphs: Paragraph[] = [];

  for (const item of items) {
    const degreeLine = item.fieldOfStudy
      ? `${item.degree || "Degree"} in ${item.fieldOfStudy}`
      : item.degree || "Degree";
    const dateStr = item.startDate ? `${item.startDate} – ${item.endDate}` : item.endDate || "";
    const gpaStr = item.gpa ? ` | GPA: ${item.gpa}` : "";

    paragraphs.push(
      new Paragraph({
        spacing: {
          before: ptToTwip(layout.density.itemSpacingPt),
          after: ptToTwip(1),
        },
        children: [
          new TextRun({
            text: degreeLine,
            font: headingFontFamily,
            bold: true,
            size: Math.round(layout.density.fontSize.itemTitlePt * 2),
            color: "0F172A",
          }),
          new TextRun({
            text: `  •  ${item.institution || "University"}${gpaStr}`,
            font: fontFamily,
            bold: false,
            size: Math.round(layout.density.fontSize.itemSubtitlePt * 2),
            color: "475569",
          }),
          ...(dateStr
            ? [
                new TextRun({
                  text: `   (${dateStr})`,
                  font: fontFamily,
                  size: Math.round(layout.density.fontSize.captionPt * 2),
                  color: "64748B",
                  italics: true,
                }),
              ]
            : []),
        ],
      })
    );

    if (item.description) {
      paragraphs.push(
        new Paragraph({
          spacing: {
            before: ptToTwip(1),
            after: ptToTwip(2),
            line: Math.round(layout.density.lineHeight * 240),
          },
          children: [
            new TextRun({
              text: item.description,
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "334155",
            }),
          ],
        })
      );
    }
  }

  return paragraphs;
}

/**
 * Builds Skills section paragraphs (categorized or inline tag list).
 */
export function buildSkillsSection(items: SkillItem[], ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily } = ctx;
  const paragraphs: Paragraph[] = [];

  // Group skills by category if present
  const categoryMap = new Map<string, string[]>();
  const uncategorized: string[] = [];

  for (const item of items) {
    if (!item.name) continue;
    if (item.category && item.category.trim()) {
      const cat = item.category.trim();
      const existing = categoryMap.get(cat) || [];
      existing.push(item.name);
      categoryMap.set(cat, existing);
    } else {
      uncategorized.push(item.name);
    }
  }

  if (categoryMap.size > 0) {
    categoryMap.forEach((skillsList, categoryName) => {
      paragraphs.push(
        new Paragraph({
          spacing: {
            before: ptToTwip(2),
            after: ptToTwip(2),
          },
          children: [
            new TextRun({
              text: `${categoryName}: `,
              font: fontFamily,
              bold: true,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "0F172A",
            }),
            new TextRun({
              text: skillsList.join(", "),
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "334155",
            }),
          ],
        })
      );
    });
  }

  if (uncategorized.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: {
          before: ptToTwip(2),
          after: ptToTwip(2),
        },
        children: [
          new TextRun({
            text: categoryMap.size > 0 ? "Other Skills: " : "",
            font: fontFamily,
            bold: categoryMap.size > 0,
            size: Math.round(layout.density.fontSize.bodyPt * 2),
            color: "0F172A",
          }),
          new TextRun({
            text: uncategorized.join("  •  "),
            font: fontFamily,
            size: Math.round(layout.density.fontSize.bodyPt * 2),
            color: "334155",
          }),
        ],
      })
    );
  }

  return paragraphs;
}

/**
 * Builds Projects section paragraphs.
 */
export function buildProjectsSection(items: ProjectItem[], ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily, headingFontFamily } = ctx;
  const paragraphs: Paragraph[] = [];

  for (const item of items) {
    const dateStr = item.startDate ? `${item.startDate} – ${item.endDate}` : item.endDate || "";
    const techStr = item.technologies?.length ? ` [${item.technologies.join(", ")}]` : "";

    paragraphs.push(
      new Paragraph({
        spacing: {
          before: ptToTwip(layout.density.itemSpacingPt),
          after: ptToTwip(1),
        },
        children: [
          new TextRun({
            text: item.title || "Project",
            font: headingFontFamily,
            bold: true,
            size: Math.round(layout.density.fontSize.itemTitlePt * 2),
            color: "0F172A",
          }),
          ...(item.subtitle
            ? [
                new TextRun({
                  text: `  •  ${item.subtitle}`,
                  font: fontFamily,
                  size: Math.round(layout.density.fontSize.itemSubtitlePt * 2),
                  color: "475569",
                }),
              ]
            : []),
          ...(techStr
            ? [
                new TextRun({
                  text: techStr,
                  font: fontFamily,
                  size: Math.round(layout.density.fontSize.captionPt * 2),
                  color: "64748B",
                }),
              ]
            : []),
          ...(dateStr
            ? [
                new TextRun({
                  text: `   (${dateStr})`,
                  font: fontFamily,
                  size: Math.round(layout.density.fontSize.captionPt * 2),
                  color: "64748B",
                  italics: true,
                }),
              ]
            : []),
        ],
      })
    );

    if (item.description) {
      paragraphs.push(
        new Paragraph({
          spacing: {
            before: ptToTwip(1),
            after: ptToTwip(2),
            line: Math.round(layout.density.lineHeight * 240),
          },
          children: [
            new TextRun({
              text: item.description,
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "334155",
            }),
          ],
        })
      );
    }
  }

  return paragraphs;
}

/**
 * Builds Certifications section paragraphs.
 */
export function buildCertificationsSection(items: CertificationItem[], ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily } = ctx;
  const paragraphs: Paragraph[] = [];

  for (const item of items) {
    const dateStr = item.issueDate ? ` (${item.issueDate})` : "";
    const issuerStr = item.issuer ? `  •  ${item.issuer}` : "";

    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: {
          before: ptToTwip(1.5),
          after: ptToTwip(1.5),
        },
        children: [
          new TextRun({
            text: item.name || "Certification",
            font: fontFamily,
            bold: true,
            size: Math.round(layout.density.fontSize.bodyPt * 2),
            color: "0F172A",
          }),
          new TextRun({
            text: `${issuerStr}${dateStr}`,
            font: fontFamily,
            size: Math.round(layout.density.fontSize.bodyPt * 2),
            color: "475569",
          }),
        ],
      })
    );
  }

  return paragraphs;
}

/**
 * Builds Languages section paragraphs.
 */
export function buildLanguagesSection(items: LanguageItem[], ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily } = ctx;
  const list = items.map((i) => (i.fluency ? `${i.language} (${i.fluency})` : i.language));

  return [
    new Paragraph({
      spacing: {
        before: ptToTwip(2),
        after: ptToTwip(2),
      },
      children: [
        new TextRun({
          text: list.join("  •  "),
          font: fontFamily,
          size: Math.round(layout.density.fontSize.bodyPt * 2),
          color: "334155",
        }),
      ],
    }),
  ];
}

/**
 * Builds Awards, Publications, Volunteering, Interests, References & Custom Sections.
 */
export function buildGenericSection(section: Section, ctx: SectionRenderContext): Paragraph[] {
  const { layout, fontFamily, headingFontFamily } = ctx;
  const paragraphs: Paragraph[] = [];

  if (section.type === "awards") {
    for (const item of section.items as AwardItem[]) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: ptToTwip(1.5), after: ptToTwip(1.5) },
          children: [
            new TextRun({
              text: item.title || "Award",
              font: headingFontFamily,
              bold: true,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "0F172A",
            }),
            new TextRun({
              text: item.issuer ? `  •  ${item.issuer} (${item.date || ""})` : "",
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "475569",
            }),
          ],
        })
      );
    }
  } else if (section.type === "publications") {
    for (const item of section.items as PublicationItem[]) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: ptToTwip(1.5), after: ptToTwip(1.5) },
          children: [
            new TextRun({
              text: item.title || "Publication",
              font: headingFontFamily,
              bold: true,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "0F172A",
            }),
            new TextRun({
              text: item.publisher ? `  •  ${item.publisher} (${item.date || ""})` : "",
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "475569",
            }),
          ],
        })
      );
    }
  } else if (section.type === "volunteer") {
    for (const item of section.items as VolunteerItem[]) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: ptToTwip(1.5), after: ptToTwip(1.5) },
          children: [
            new TextRun({
              text: item.role || "Volunteer",
              font: headingFontFamily,
              bold: true,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "0F172A",
            }),
            new TextRun({
              text: `  •  ${item.organization || ""}`,
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "475569",
            }),
          ],
        })
      );
    }
  } else if (section.type === "interests") {
    const list = (section.items as InterestItem[]).map((i) => i.name).filter(Boolean);
    paragraphs.push(
      new Paragraph({
        spacing: { before: ptToTwip(2), after: ptToTwip(2) },
        children: [
          new TextRun({
            text: list.join("  •  "),
            font: fontFamily,
            size: Math.round(layout.density.fontSize.bodyPt * 2),
            color: "334155",
          }),
        ],
      })
    );
  } else if (section.type === "references") {
    for (const item of section.items as ReferenceItem[]) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: ptToTwip(2), after: ptToTwip(1) },
          children: [
            new TextRun({
              text: item.name || "Reference",
              font: headingFontFamily,
              bold: true,
              size: Math.round(layout.density.fontSize.itemTitlePt * 2),
              color: "0F172A",
            }),
            new TextRun({
              text: `  •  ${item.relationship || ""}, ${item.company || ""}`,
              font: fontFamily,
              size: Math.round(layout.density.fontSize.bodyPt * 2),
              color: "475569",
            }),
            ...(item.email || item.phone
              ? [
                  new TextRun({
                    text: ` (${[item.email, item.phone].filter(Boolean).join(" | ")})`,
                    font: fontFamily,
                    size: Math.round(layout.density.fontSize.captionPt * 2),
                    color: "64748B",
                  }),
                ]
              : []),
          ],
        })
      );
    }
  } else if (section.type === "custom") {
    for (const item of section.items as CustomItem[]) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: ptToTwip(2), after: ptToTwip(1) },
          children: [
            new TextRun({
              text: item.title || "Note",
              font: headingFontFamily,
              bold: true,
              size: Math.round(layout.density.fontSize.itemTitlePt * 2),
              color: "0F172A",
            }),
            ...(item.subtitle
              ? [
                  new TextRun({
                    text: `  •  ${item.subtitle}`,
                    font: fontFamily,
                    size: Math.round(layout.density.fontSize.bodyPt * 2),
                    color: "475569",
                  }),
                ]
              : []),
          ],
        })
      );
      if (item.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: ptToTwip(1), after: ptToTwip(2) },
            children: [
              new TextRun({
                text: item.description,
                font: fontFamily,
                size: Math.round(layout.density.fontSize.bodyPt * 2),
                color: "334155",
              }),
            ],
          })
        );
      }
    }
  }

  return paragraphs;
}

/**
 * Dispatches and renders any section type into docx Paragraphs.
 */
export function renderDocxSection(section: Section, ctx: SectionRenderContext): Paragraph[] {
  if (!section.visible || !section.items || section.items.length === 0) {
    return [];
  }

  const heading = buildSectionHeading(section.title, ctx);
  let bodyParagraphs: Paragraph[] = [];

  switch (section.type) {
    case "experience":
      bodyParagraphs = buildExperienceSection(section.items as ExperienceItem[], ctx);
      break;
    case "education":
      bodyParagraphs = buildEducationSection(section.items as EducationItem[], ctx);
      break;
    case "skills":
      bodyParagraphs = buildSkillsSection(section.items as SkillItem[], ctx);
      break;
    case "projects":
      bodyParagraphs = buildProjectsSection(section.items as ProjectItem[], ctx);
      break;
    case "certifications":
      bodyParagraphs = buildCertificationsSection(section.items as CertificationItem[], ctx);
      break;
    case "languages":
      bodyParagraphs = buildLanguagesSection(section.items as LanguageItem[], ctx);
      break;
    default:
      bodyParagraphs = buildGenericSection(section, ctx);
      break;
  }

  return [heading, ...bodyParagraphs];
}

/**
 * Shared single-column document builder used by single-column templates.
 */
export function buildSingleColumnDocx(data: ResumeData, options: DocxTemplateOptions) {
  const layout = getComputedResumeLayout(data.theme);
  const accentHex = cleanHexColor(data.theme?.accentColor || layout.accentColor);
  const fontFamily = mapDocxFont(options.fontFamily || layout.fonts.pdfPrimaryFont);
  const headingFontFamily = mapDocxFont(options.headingFontFamily || options.fontFamily || layout.fonts.pdfPrimaryFont);

  const ctx: SectionRenderContext = {
    data,
    layout,
    options,
    accentHex,
    fontFamily,
    headingFontFamily,
  };

  const headerParagraphs = buildDocxHeader(ctx);

  // Render sections in exact user order (respecting visible flag)
  const sectionParagraphs: Paragraph[] = [];
  for (const sec of data.sections) {
    const rendered = renderDocxSection(sec, ctx);
    sectionParagraphs.push(...rendered);
  }

  return {
    pageProperties: buildPageProperties(layout),
    children: [...headerParagraphs, ...sectionParagraphs],
  };
}

/**
 * Shared two-column document builder (Word borderless table layout)
 * used by two-column / sidebar templates.
 */
export function buildTwoColumnDocx(data: ResumeData, options: DocxTemplateOptions) {
  const layout = getComputedResumeLayout(data.theme);
  const accentHex = cleanHexColor(data.theme?.accentColor || layout.accentColor);
  const fontFamily = mapDocxFont(options.fontFamily || layout.fonts.pdfPrimaryFont);
  const headingFontFamily = mapDocxFont(options.headingFontFamily || options.fontFamily || layout.fonts.pdfPrimaryFont);

  const ctx: SectionRenderContext = {
    data,
    layout,
    options,
    accentHex,
    fontFamily,
    headingFontFamily,
  };

  const headerParagraphs = buildDocxHeader(ctx);

  // Total printable width in twips
  const totalWidthTwips = 11906 - ptToTwip(layout.margins.horizontalPt * 2);
  const sidebarWidthPercent = options.sidebarWidthPercent || 32;
  const sidebarWidthTwips = Math.round((totalWidthTwips * sidebarWidthPercent) / 100);
  const mainWidthTwips = totalWidthTwips - sidebarWidthTwips;

  // Classify sections into sidebar vs main
  const defaultSidebarTypes = new Set(options.sidebarSections || ["skills", "education", "languages", "certifications", "interests"]);

  const sidebarParagraphs: Paragraph[] = [];
  const mainParagraphs: Paragraph[] = [];

  for (const sec of data.sections) {
    if (!sec.visible || !sec.items || sec.items.length === 0) continue;
    const rendered = renderDocxSection(sec, ctx);
    if (defaultSidebarTypes.has(sec.type)) {
      sidebarParagraphs.push(...rendered);
    } else {
      mainParagraphs.push(...rendered);
    }
  }

  const borderless = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const gridTable = new Table({
    width: {
      size: totalWidthTwips,
      type: WidthType.DXA,
    },
    borders: borderless,
    rows: [
      new TableRow({
        children: [
          // Sidebar Column
          new TableCell({
            width: { size: sidebarWidthTwips, type: WidthType.DXA },
            borders: {
              ...borderless,
              right: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: "E2E8F0",
              },
            },
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: ptToTwip(12),
            },
            children: sidebarParagraphs.length > 0 ? sidebarParagraphs : [new Paragraph({})],
          }),
          // Main Column
          new TableCell({
            width: { size: mainWidthTwips, type: WidthType.DXA },
            borders: borderless,
            margins: {
              top: 0,
              bottom: 0,
              left: ptToTwip(12),
              right: 0,
            },
            children: mainParagraphs.length > 0 ? mainParagraphs : [new Paragraph({})],
          }),
        ],
      }),
    ],
  });

  return {
    pageProperties: buildPageProperties(layout),
    children: [...headerParagraphs, gridTable],
  };
}
