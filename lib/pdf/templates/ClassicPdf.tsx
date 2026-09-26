import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const ClassicPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e293b";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 40,
      fontSize: 9.5,
      fontFamily: "Lora",
      color: "#0f172a",
      },
    header: {
      textAlign: "center",
      borderBottomWidth: 1.5,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 12,
      marginBottom: 14,
      alignItems: "center",
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Lora",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: "#0f172a",
      marginBottom: 3,
    },
    title: {
      fontSize: 10.5,
      color: "#475569",
      marginBottom: 5,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 6,
      fontSize: 8.5,
      color: "#475569",
    },
    summary: {
      fontSize: 8.5,
      color: "#334155",
      textAlign: "center",
      marginTop: 6,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: "Lora",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: accentColor,
      borderBottomWidth: 0.8,
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
    bulletList: {
      marginLeft: 12,
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      width: 8,
      fontSize: 8.5,
      color: "#64748b",
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
      {/* Centered Formal Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {[
            personalInfo.location,
            personalInfo.phone,
            personalInfo.email,
            personalInfo.linkedin ? personalInfo.linkedin.replace(/^https?:\/\//, "") : null,
            personalInfo.website ? personalInfo.website.replace(/^https?:\/\//, "") : null,
          ]
            .filter(Boolean)
            .map((item, idx, arr) => (
              <Text key={idx}>
                {item} {idx < arr.length - 1 ? " • " : ""}
              </Text>
            ))}
        </View>

        {personalInfo.summary ? (
          <Text style={styles.summary}>"{personalInfo.summary}"</Text>
        ) : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.company} — {exp.position}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                {exp.location ? <Text style={styles.itemSubtitle}>{exp.location}</Text> : null}
                {exp.description ? (
                  <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text>
                ) : null}
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
                  <Text style={styles.itemTitle}>{edu.institution} — {edu.degree}</Text>
                  <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <Text style={styles.itemSubtitle}>
                  {edu.fieldOfStudy ? `Field: ${edu.fieldOfStudy} ` : ""}
                  {edu.gpa ? `(GPA: ${edu.gpa})` : ""}
                </Text>
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}

          {section.type === "skills" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }} wrap={false}>
              <Text style={{ fontSize: 9, color: "#334155" }}>
                {(section.items as SkillItem[]).map((s) => s.name).join(", ")}
              </Text>
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
    </Page>
  );
};
