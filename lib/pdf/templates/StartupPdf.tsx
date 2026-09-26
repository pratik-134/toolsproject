import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const StartupPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#f97316";

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
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: 10,
    },
    operatorBadge: {
      fontSize: 8,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: accentColor,
      marginBottom: 2,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
    },
    title: {
      fontSize: 9.5,
      color: "#475569",
      marginTop: 1,
    },
    contactBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    contactBadge: {
      backgroundColor: "#f1f5f9",
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 7.5,
      color: "#475569",
    },
    summaryCard: {
      backgroundColor: "#fff7ed",
      borderWidth: 1,
      borderColor: "#fed7aa",
      borderStyle: "solid",
      borderRadius: 6,
      padding: 8,
      marginBottom: 10,
    },
    summaryLabel: {
      fontSize: 8,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
      marginBottom: 2,
    },
    summaryText: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.35,
    },
    section: {
      marginBottom: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    sectionDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: accentColor,
      marginRight: 6,
    },
    sectionTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#0f172a",
    },
    sectionLine: {
      flex: 1,
      borderBottomWidth: 0.8,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      marginLeft: 6,
    },
    expCard: {
      borderWidth: 0.8,
      borderColor: "#e2e8f0",
      borderStyle: "solid",
      borderRadius: 4,
      padding: 8,
      marginBottom: 6,
      backgroundColor: "#ffffff",
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
    itemDate: {
      fontSize: 8,
      color: "#64748b",
    },
    itemCompany: {
      fontSize: 8.5,
      fontStyle: "italic",
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
      color: "#334155",
      },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillBadge: {
      backgroundColor: "#0f172a",
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 8,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#ffffff",
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.operatorBadge}>High-Growth Operator</Text>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
            {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
          </View>
          <View style={styles.contactBadges}>
            {personalInfo.email ? <Text style={styles.contactBadge}>{personalInfo.email}</Text> : null}
            {personalInfo.phone ? <Text style={styles.contactBadge}>{personalInfo.phone}</Text> : null}
            {personalInfo.location ? <Text style={styles.contactBadge}>{personalInfo.location}</Text> : null}
          </View>
        </View>
      </View>

      {personalInfo.summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Value Proposition & Impact:</Text>
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      ) : null}

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionLine} />
          </View>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.expCard} wrap={false}>
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
              <View key={edu.id} style={[styles.itemHeader, { borderBottomWidth: 0.8, borderBottomColor: "#f1f5f9", paddingBottom: 3, marginBottom: 3 }]} wrap={false}>
                <View>
                  <Text style={styles.itemTitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                  <Text style={{ fontSize: 8.5, color: "#475569" }}>{edu.institution} {edu.gpa ? `(GPA ${edu.gpa})` : ""}</Text>
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
              <View key={proj.id} style={{ borderWidth: 0.8, borderColor: "#e2e8f0", padding: 6, borderRadius: 4, marginBottom: 4 }} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  <Text style={styles.itemDate}>{proj.startDate} – {proj.endDate}</Text>
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {!["experience", "education", "skills", "projects"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={[styles.itemHeader, { borderBottomWidth: 0.8, borderBottomColor: "#f1f5f9", paddingBottom: 2, marginBottom: 3 }]} wrap={false}>
                <Text style={styles.itemTitle}>{item.title || item.name || item.organization}</Text>
                <Text style={styles.itemDate}>{item.date || item.issueDate}</Text>
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
