import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const SwissPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#dc2626";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 36,
      fontSize: 9,
      fontFamily: "Inter",
      color: "#000000",
      },
    header: {
      borderBottomWidth: 3,
      borderBottomColor: "#000000",
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    fullName: {
      fontSize: 24,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: -0.5,
      color: "#000000",
      lineHeight: 1.0,
    },
    title: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: accentColor,
      marginTop: 3,
    },
    contactRight: {
      alignItems: "flex-end",
      fontSize: 8,
      color: "#333333",
    },
    summary: {
      fontSize: 8.5,
      color: "#111111",
      lineHeight: 1.4,
      borderTopWidth: 1,
      borderTopColor: "#000000",
      borderTopStyle: "solid",
      paddingTop: 6,
      marginTop: 8,
    },
    sectionGrid: {
      flexDirection: "row",
      marginBottom: 10,
    },
    sectionLeft: {
      width: "24%",
      borderTopWidth: 2,
      borderTopColor: "#000000",
      borderTopStyle: "solid",
      paddingTop: 4,
      paddingRight: 8,
    },
    sectionTitle: {
      fontSize: 8.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#000000",
    },
    sectionRight: {
      width: "76%",
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
      borderTopStyle: "solid",
      paddingTop: 4,
    },
    itemBlock: {
      marginBottom: 6,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemDescription: {
      fontSize: 9,
      color: "#222222",
      marginTop: 2,
      marginBottom: 3,
    },
    itemTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#000000",
    },
    itemDate: {
      fontSize: 8,
      color: "#64748b",
    },
    itemCompany: {
      fontSize: 8.5,
      color: "#333333",
      marginBottom: 2,
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
      color: "#000000",
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5,
      color: "#222222",
      },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillBadge: {
      borderWidth: 1,
      borderColor: "#000000",
      borderStyle: "solid",
      paddingVertical: 1.5,
      paddingHorizontal: 5,
      fontSize: 8,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#000000",
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Swiss Modernist Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
            {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
          </View>
          <View style={styles.contactRight}>
            {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
            {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
            {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
          </View>
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Swiss Strict 2-Column Grid */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.sectionGrid} wrap={true}>
          <View style={styles.sectionLeft}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>

          <View style={styles.sectionRight}>
            {section.type === "experience" &&
              (section.items as ExperienceItem[]).map((exp) => (
                <View key={exp.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.itemCompany}>{exp.company} / {exp.location}</Text>
                  {exp.description ? <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text> : null}
                  {exp.highlights && exp.highlights.length > 0 ? (
                    <View style={styles.bulletList}>
                      {exp.highlights.map((h, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>■</Text>
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
        </View>
      ))}
    </Page>
  );
};
