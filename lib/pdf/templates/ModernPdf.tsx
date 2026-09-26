import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";
import { getComputedResumeLayout } from "@/lib/resume-layout";

registerPdfFonts();

export const ModernPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const layout = getComputedResumeLayout(theme);
  const accentColor = layout.accentColor;

  const styles = StyleSheet.create({
    page: {
      ...layout.pdf.pageStyle,
    },
    header: {
      borderBottomWidth: 1.5,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: layout.density.headerMarginBottomPt,
    },
    fullName: {
      fontSize: layout.density.fontSize.namePt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      color: accentColor,
      marginBottom: 3,
    },
    title: {
      fontSize: layout.density.fontSize.titlePt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      color: "#475569",
      marginBottom: 6,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      fontSize: 8.5,
      color: "#64748b",
      marginBottom: 6,
    },
    contactItem: {
      fontSize: 8.5,
      color: "#475569",
    },
    summary: {
      fontSize: 9,
      color: "#334155",
      marginTop: 4,
    },
    section: {
      marginBottom: layout.density.sectionSpacingPt,
    },
    sectionTitle: {
      fontSize: layout.density.fontSize.sectionHeadingPt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      color: accentColor,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      borderBottomWidth: 1,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: layout.density.itemSpacingPt,
    },
    itemBlock: {
      marginBottom: layout.density.itemSpacingPt,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: layout.density.fontSize.itemTitlePt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      color: "#0f172a",
    },
    itemDate: {
      fontSize: layout.density.fontSize.captionPt,
      color: "#64748b",
    },
    itemSubtitle: {
      fontSize: layout.density.fontSize.itemSubtitlePt,
      color: "#475569",
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: layout.density.fontSize.bodyPt,
      color: "#334155",
      marginTop: 2,
      marginBottom: layout.density.bulletSpacingPt,
    },
    bulletList: {
      marginLeft: 6,
      marginTop: layout.density.bulletSpacingPt,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: layout.density.bulletSpacingPt,
    },
    bulletDot: {
      width: 10,
      fontSize: layout.density.fontSize.bodyPt,
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: layout.density.fontSize.bodyPt,
      color: "#334155",
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    skillBadge: {
      backgroundColor: "#f1f5f9",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      fontSize: 8.5,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#334155",
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {personalInfo.email ? <Text style={styles.contactItem}>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text style={styles.contactItem}>• {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text style={styles.contactItem}>• {personalInfo.location}</Text> : null}
          {personalInfo.website ? <Text style={styles.contactItem}>• {personalInfo.website.replace(/^https?:\/\//, "")}</Text> : null}
          {personalInfo.linkedin ? <Text style={styles.contactItem}>• {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "linkedin.com/in/")}</Text> : null}
          {personalInfo.github ? <Text style={styles.contactItem}>• {personalInfo.github.replace(/^https?:\/\//, "")}</Text> : null}
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.position}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                    {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `• ${exp.location}` : ""}</Text>
                {exp.description ? <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text> : null}
                {exp.highlights && exp.highlights.length > 0 ? (
                  <View style={styles.bulletList}>
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}

          {section.type === "education" &&
            (section.items as EducationItem[]).map((edu) => (
              <View key={edu.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</Text>
                  <Text style={styles.itemDate}>{edu.startDate} – {edu.current ? "Present" : edu.endDate}</Text>
                </View>
                <Text style={styles.itemSubtitle}>{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</Text>
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}

          {section.type === "skills" && (
            <View style={styles.skillsContainer} wrap={false}>
              {(section.items as SkillItem[]).map((s) => (
                <Text key={s.id} style={styles.skillBadge}>{s.name}</Text>
              ))}
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  <Text style={styles.itemDate}>{proj.startDate} – {proj.endDate}</Text>
                </View>
                {proj.subtitle ? <Text style={styles.itemSubtitle}>{proj.subtitle}</Text> : null}
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {section.type === "certifications" &&
            (section.items as CertificationItem[]).map((c) => (
              <View key={c.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={styles.itemTitle}>{c.name} — {c.issuer}</Text>
                <Text style={styles.itemDate}>{c.issueDate}</Text>
              </View>
            ))}

          {section.type === "languages" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }} wrap={false}>
              {(section.items as LanguageItem[]).map((l) => (
                <Text key={l.id} style={{ fontSize: 9 }}>
                  <Text style={{ fontFamily: "Inter", fontWeight: 700 }}>{l.language}</Text>: {l.fluency}
                </Text>
              ))}
            </View>
          )}

          {!["experience", "education", "skills", "projects", "certifications", "languages"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title || item.name || item.organization}</Text>
                  <Text style={styles.itemDate}>{item.date || item.startDate}</Text>
                </View>
                {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
