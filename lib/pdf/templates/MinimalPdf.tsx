import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const MinimalPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#0f172a";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 40,
      fontSize: 9,
      fontFamily: "Inter",
      color: "#334155",
      },
    header: {
      marginBottom: 16,
    },
    fullName: {
      fontSize: 26,
      fontFamily: "Inter",
      fontWeight: 400,
      letterSpacing: -0.5,
      color: "#020617",
      marginBottom: 3,
    },
    title: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: accentColor,
      marginBottom: 6,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      fontSize: 8.5,
      color: "#64748b",
      marginBottom: 6,
    },
    summary: {
      fontSize: 8.5,
      color: "#475569",
      lineHeight: 1.5,
      marginTop: 4,
      maxWidth: 480,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 8.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: accentColor,
      marginBottom: 6,
    },
    itemBlock: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
    },
    itemSubtitle: {
      fontSize: 9,
      color: "#64748b",
      fontFamily: "Inter",
      fontWeight: 400,
    },
    itemDescription: {
      fontSize: 9,
      color: "#475569",
      marginTop: 2,
      marginBottom: 3,
    },
    itemDate: {
      fontSize: 8.5,
      color: "#94a3b8",
    },
    bulletList: {
      borderLeftWidth: 1.5,
      borderLeftColor: "#e2e8f0",
      borderLeftStyle: "solid",
      paddingLeft: 8,
      marginLeft: 4,
      marginTop: 3,
    },
    bulletText: {
      fontSize: 8.5,
      color: "#475569",
      marginBottom: 2,
    },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    skillItem: {
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 2,
      fontSize: 8.5,
      color: "#334155",
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
          {personalInfo.website ? <Text>{personalInfo.website.replace(/^https?:\/\//, "")}</Text> : null}
          {personalInfo.linkedin ? <Text>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "in/")}</Text> : null}
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
                  <Text style={styles.itemTitle}>
                    {exp.position} <Text style={styles.itemSubtitle}>— {exp.company}</Text>
                  </Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                {exp.description ? <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text> : null}
                {exp.highlights && exp.highlights.length > 0 ? (
                  <View style={styles.bulletList}>
                    {exp.highlights.map((h, i) => (
                      <Text key={i} style={styles.bulletText}>{h}</Text>
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
                <Text style={styles.itemSubtitle}>{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</Text>
              </View>
            ))}

          {section.type === "skills" && (
            <View style={styles.skillsRow} wrap={false}>
              {(section.items as SkillItem[]).map((s) => (
                <Text key={s.id} style={styles.skillItem}>{s.name}</Text>
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
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {section.type === "certifications" &&
            (section.items as CertificationItem[]).map((c) => (
              <View key={c.id} style={[styles.itemHeader, { marginBottom: 2 }]} wrap={false}>
                <Text style={{ fontSize: 8.5, color: "#1e293b" }}>{c.name} ({c.issuer})</Text>
                <Text style={styles.itemDate}>{c.issueDate}</Text>
              </View>
            ))}

          {section.type === "languages" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }} wrap={false}>
              {(section.items as LanguageItem[]).map((l) => (
                <Text key={l.id} style={{ fontSize: 8.5, color: "#475569" }}>
                  {l.language}: {l.fluency}
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
