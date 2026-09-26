import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const HybridPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#312e81";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 0,
      paddingBottom: 28,
      paddingHorizontal: 0,
      fontSize: 9,
      fontFamily: "Inter",
      color: "#1e293b",
      },
    headerBanner: {
      backgroundColor: accentColor,
      color: "#ffffff",
      paddingTop: 28,
      paddingBottom: 20,
      paddingHorizontal: 36,
      marginBottom: 14,
    },
    fullName: {
      fontSize: 24,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#ffffff",
      lineHeight: 1.1,
    },
    title: {
      fontSize: 10,
      color: "#e0e7ff",
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      fontSize: 8,
      color: "#c7d2fe",
      marginTop: 6,
    },
    summary: {
      fontSize: 8.5,
      color: "#f1f5f9",
      lineHeight: 1.4,
      borderTopWidth: 0.8,
      borderTopColor: "rgba(255, 255, 255, 0.2)",
      borderTopStyle: "solid",
      paddingTop: 6,
      marginTop: 8,
    },
    bodyContainer: {
      paddingHorizontal: 36,
    },
    section: {
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: accentColor,
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: 6,
    },
    itemBlock: {
      marginBottom: 6,
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
    itemDate: {
      fontSize: 8,
      color: "#64748b",
    },
    itemSubtitle: {
      fontSize: 8.5,
      fontStyle: "italic",
      color: "#475569",
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 9,
      color: "#334155",
      marginTop: 2,
      marginBottom: 3,
    },
    bulletList: {
      marginLeft: 8,
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 1.5,
    },
    bulletDot: {
      width: 8,
      fontSize: 8,
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5,
      color: "#334155",
      },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillBadge: {
      backgroundColor: "#f1f5f9",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      fontSize: 8,
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
      {/* Deep Tone Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>• {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>• {personalInfo.location}</Text> : null}
          {personalInfo.linkedin ? <Text>• {personalInfo.linkedin.replace(/^https?:\/\//, "")}</Text> : null}
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Main Body */}
      <View style={styles.bodyContainer}>
        {activeSections.map((section) => (
          <View key={section.id} style={styles.section} wrap={true}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.type === "experience" &&
              (section.items as ExperienceItem[]).map((exp) => (
                <View key={exp.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{exp.company} • {exp.location}</Text>
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
                <View key={edu.id} style={[styles.itemBlock, styles.itemHeader]} wrap={false}>
                  <View>
                    <Text style={styles.itemTitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                    <Text style={{ fontSize: 8.5, color: "#475569" }}>{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</Text>
                  </View>
                  <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate}</Text>
                </View>
              ))}

            {section.type === "skills" && (
              <View style={styles.skillsRow} wrap={false}>
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
                  {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
                </View>
              ))}

            {!["experience", "education", "skills", "projects"].includes(section.type) &&
              section.items.map((item: any) => (
                <View key={item.id} style={[styles.itemBlock, styles.itemHeader]} wrap={false}>
                  <Text style={styles.itemTitle}>{item.title || item.name || item.organization}</Text>
                  <Text style={styles.itemDate}>{item.date || item.issueDate}</Text>
                </View>
              ))}
          </View>
        ))}
      </View>
    </Page>
  );
};
