import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const InfographicLightPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#059669";

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
      fontSize: 10,
      fontFamily: "Inter",
      fontWeight: 700,
      color: accentColor,
      marginTop: 2,
    },
    contactBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    emailBadge: {
      backgroundColor: "#ecfdf5",
      borderWidth: 0.8,
      borderColor: "#a7f3d0",
      borderStyle: "solid",
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 8,
      color: "#065f46",
    },
    contactBadge: {
      backgroundColor: "#f1f5f9",
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 8,
      color: "#475569",
    },
    summary: {
      fontSize: 8.5,
      color: "#475569",
      lineHeight: 1.4,
      marginTop: 6,
    },
    section: {
      marginBottom: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 3,
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: accentColor,
    },
    sectionPill: {
      width: 24,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: accentColor,
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
    skillsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skillCard: {
      width: "31%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 0.8,
      borderColor: "#e2e8f0",
      borderStyle: "solid",
      backgroundColor: "#f8fafc",
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderRadius: 3,
    },
    skillName: {
      fontSize: 8,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#334155",
    },
    dotRow: {
      flexDirection: "row",
      gap: 2,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
            {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
          </View>
          <View style={styles.contactBadges}>
            {personalInfo.email ? <Text style={styles.emailBadge}>{personalInfo.email}</Text> : null}
            {personalInfo.phone ? <Text style={styles.contactBadge}>{personalInfo.phone}</Text> : null}
            {personalInfo.location ? <Text style={styles.contactBadge}>{personalInfo.location}</Text> : null}
          </View>
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionPill} />
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
              <View key={edu.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                  <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <Text style={styles.itemSubtitle}>{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</Text>
              </View>
            ))}

          {section.type === "skills" && (
            <View style={styles.skillsGrid} wrap={false}>
              {(section.items as SkillItem[]).map((s) => {
                const rating = s.rating || (s.level === "expert" ? 5 : s.level === "advanced" ? 4 : s.level === "intermediate" ? 3 : 2);
                return (
                  <View key={s.id} style={styles.skillCard}>
                    <Text style={styles.skillName}>{s.name}</Text>
                    <View style={styles.dotRow}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <View
                          key={dot}
                          style={[
                            styles.dot,
                            { backgroundColor: dot <= rating ? accentColor : "#e2e8f0" },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
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
