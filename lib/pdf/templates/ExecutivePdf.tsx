import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const ExecutivePdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e293b";

  const styles = StyleSheet.create({
    page: {
      fontSize: 9.5,
      fontFamily: "Lora",
      color: "#0f172a",
      },
    headerBanner: {
      backgroundColor: accentColor,
      color: "#ffffff",
      paddingTop: 28,
      paddingBottom: 22,
      paddingHorizontal: 36,
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Playfair",
      fontWeight: 700,
      textTransform: "uppercase",
      color: "#ffffff",
      letterSpacing: 1,
      marginBottom: 3,
    },
    title: {
      fontSize: 11,
      color: "#cbd5e1",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      fontSize: 8.5,
      color: "#e2e8f0",
      marginTop: 2,
    },
    body: {
      paddingHorizontal: 36,
      paddingTop: 18,
      paddingBottom: 32,
    },
    summaryBox: {
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 9,
      fontFamily: "Inter",
      fontWeight: 700,
      color: accentColor,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 3,
    },
    summaryText: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.45,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 10.5,
      fontFamily: "Playfair",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: accentColor,
      borderBottomWidth: 1.2,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: 8,
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
      fontSize: 10,
      fontFamily: "Lora",
      fontWeight: 700,
      color: "#0f172a",
    },
    itemDate: {
      fontSize: 8.5,
      color: "#475569",
    },
    itemSubtitle: {
      fontSize: 9,
      color: "#334155",
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 9,
      color: "#334155",
      marginTop: 2,
      marginBottom: 3,
    },
    bulletItem: {
      flexDirection: "row",
      marginLeft: 10,
      marginBottom: 2,
    },
    bulletDot: {
      width: 8,
      fontSize: 8.5,
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
      {/* Executive Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>• {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>• {personalInfo.location}</Text> : null}
          {personalInfo.linkedin ? <Text>• {personalInfo.linkedin.replace(/^https?:\/\//, "")}</Text> : null}
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {personalInfo.summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Executive Profile</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        ) : null}

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
                  <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `— ${exp.location}` : ""}</Text>
                  {exp.description ? <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text> : null}
                  {exp.highlights && exp.highlights.length > 0 ? (
                    <View style={{ marginTop: 2 }}>
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
                  <Text style={styles.itemSubtitle}>{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</Text>
                </View>
              ))}

            {section.type === "skills" && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }} wrap={false}>
                {(section.items as SkillItem[]).map((s) => (
                  <Text
                    key={s.id}
                    style={{
                      borderWidth: 0.5,
                      borderColor: "#cbd5e1",
                      borderStyle: "solid",
                      paddingVertical: 1.5,
                      paddingHorizontal: 6,
                      fontSize: 8.5,
                    }}
                  >
                    {s.name}
                  </Text>
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
                <View key={item.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title || item.name || item.organization}</Text>
                    <Text style={styles.itemDate}>{item.date || item.issueDate}</Text>
                  </View>
                  {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
                </View>
              ))}
          </View>
        ))}
      </View>
    </Page>
  );
};
