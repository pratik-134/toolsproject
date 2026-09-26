import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const CorporatePdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e40af";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 36,
      fontSize: 9,
      fontFamily: "Inter",
      color: "#1e293b",
      },
    header: {
      borderBottomWidth: 2,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 8,
      marginBottom: 10,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
    },
    title: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#475569",
      marginTop: 2,
    },
    contactRight: {
      alignItems: "flex-end",
      fontSize: 8,
      color: "#475569",
    },
    summary: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.4,
      marginTop: 6,
    },
    section: {
      marginBottom: 10,
    },
    sectionStrip: {
      backgroundColor: "#f1f5f9",
      borderLeftWidth: 3.5,
      borderLeftColor: accentColor,
      borderLeftStyle: "solid",
      paddingVertical: 3,
      paddingHorizontal: 6,
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#0f172a",
    },
    itemBlock: {
      marginBottom: 6,
      paddingHorizontal: 4,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemDescription: {
      fontSize: 9,
      color: "#334155",
      marginTop: 2,
      marginBottom: 3,
    },
    itemTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
    },
    itemCompany: {
      fontSize: 9,
      fontWeight: 700,
      color: "#475569",
    },
    itemDate: {
      fontSize: 8,
      color: "#64748b",
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
    skillsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 4,
    },
    skillItem: {
      width: "33.33%",
      fontSize: 8.5,
      color: "#334155",
      marginBottom: 2,
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  const contactLine1 = [personalInfo.email, personalInfo.phone].filter(Boolean).join(" | ");
  const contactLine2 = [personalInfo.location, personalInfo.linkedin ? personalInfo.linkedin.replace(/^https?:\/\//, "") : null].filter(Boolean).join(" | ");

  return (
    <Page size="A4" style={styles.page}>
      {/* Corporate Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
            {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
          </View>
          <View style={styles.contactRight}>
            {contactLine1 ? <Text>{contactLine1}</Text> : null}
            {contactLine2 ? <Text>{contactLine2}</Text> : null}
          </View>
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionStrip}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.position} — <Text style={styles.itemCompany}>{exp.company}</Text>
                  </Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
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
            <View style={styles.skillsGrid} wrap={false}>
              {(section.items as SkillItem[]).map((s) => (
                <Text key={s.id} style={styles.skillItem}>• {s.name}</Text>
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
    </Page>
  );
};
