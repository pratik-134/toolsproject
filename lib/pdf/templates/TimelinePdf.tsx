import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const TimelinePdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#3b82f6";

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
      marginBottom: 12,
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 10,
      fontFamily: "Inter",
      fontWeight: 700,
      color: accentColor,
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      fontSize: 8,
      color: "#64748b",
      marginTop: 4,
    },
    summary: {
      fontSize: 8.5,
      color: "#475569",
      lineHeight: 1.4,
      marginTop: 6,
    },
    section: {
      marginBottom: 11,
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
      color: accentColor,
    },
    timelineTrack: {
      borderLeftWidth: 1.5,
      borderLeftColor: "#cbd5e1",
      borderLeftStyle: "solid",
      paddingLeft: 12,
      marginLeft: 4,
    },
    timelineItem: {
      marginBottom: 8,
      position: "relative",
    },
    timelineNode: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: accentColor,
      borderStyle: "solid",
      backgroundColor: "#ffffff",
      position: "absolute",
      left: -17,
      top: 1,
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
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>• {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>• {personalInfo.location}</Text> : null}
          {personalInfo.website ? <Text>• {personalInfo.website.replace(/^https?:\/\//, "")}</Text> : null}
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>

          {section.type === "experience" && (
            <View style={styles.timelineTrack}>
              {(section.items as ExperienceItem[]).map((exp) => (
                <View key={exp.id} style={styles.timelineItem} wrap={false}>
                  <View style={styles.timelineNode} />
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
            </View>
          )}

          {section.type === "education" && (
            <View style={styles.timelineTrack}>
              {(section.items as EducationItem[]).map((edu) => (
                <View key={edu.id} style={styles.timelineItem} wrap={false}>
                  <View style={styles.timelineNode} />
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                    <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate}</Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</Text>
                </View>
              ))}
            </View>
          )}

          {section.type === "skills" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }} wrap={false}>
              {(section.items as SkillItem[]).map((s) => (
                <View key={s.id} style={{ backgroundColor: "#f1f5f9", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3 }}>
                  <Text style={{ fontSize: 8, color: "#334155", fontFamily: "Inter", fontWeight: 700 }}>{s.name}</Text>
                </View>
              ))}
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={{ borderWidth: 0.8, borderColor: "#e2e8f0", padding: 6, borderRadius: 3, marginBottom: 4 }} wrap={false}>
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
