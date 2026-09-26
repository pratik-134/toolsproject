import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const BoldPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#18181b";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 36,
      fontSize: 9,
      fontFamily: "Poppins",
      color: "#0f172a",
      },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderBottomWidth: 3.5,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: 10,
    },
    headerLeft: {
      flex: 1,
    },
    fullName: {
      fontSize: 24,
      fontFamily: "Poppins",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: -0.5,
      color: "#020617",
      lineHeight: 1.1,
    },
    title: {
      fontSize: 10,
      fontFamily: "Poppins",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#475569",
      marginTop: 2,
    },
    headerRight: {
      alignItems: "flex-end",
      fontSize: 8,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#475569",
    },
    summaryBox: {
      backgroundColor: "#f1f5f9",
      padding: 8,
      borderRadius: 4,
      marginBottom: 10,
    },
    summaryText: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.4,
    },
    section: {
      marginBottom: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    sectionBar: {
      width: 4,
      height: 12,
      backgroundColor: accentColor,
      marginRight: 6,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: "Poppins",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#020617",
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
      color: "#334155",
      marginTop: 2,
      marginBottom: 3,
    },
    itemTitle: {
      fontSize: 10,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#020617",
    },
    itemDate: {
      fontSize: 8,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#64748b",
    },
    itemCompany: {
      fontSize: 9,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#475569",
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
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5,
      fontFamily: "Poppins",
      color: "#334155",
      },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillBadge: {
      backgroundColor: "#0f172a",
      paddingVertical: 2.5,
      paddingHorizontal: 7,
      borderRadius: 3,
      fontSize: 8,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#ffffff",
    },
    projectBox: {
      borderLeftWidth: 3,
      borderLeftColor: accentColor,
      borderLeftStyle: "solid",
      paddingLeft: 6,
      marginBottom: 5,
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Heavy Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
          {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
        </View>
        <View style={styles.headerRight}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
        </View>
      </View>

      {personalInfo.summary ? (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      ) : null}

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.position}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.itemCompany}>{exp.company} • {exp.location}</Text>
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
                  <Text style={styles.itemTitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                  <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <Text style={styles.itemCompany}>{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</Text>
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
              <View key={proj.id} style={styles.projectBox} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  <Text style={styles.itemDate}>{proj.startDate} – {proj.endDate}</Text>
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {!["experience", "education", "skills", "projects"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={styles.itemTitle}>{item.title || item.name || item.organization}</Text>
                <Text style={styles.itemDate}>{item.date || item.issueDate}</Text>
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
