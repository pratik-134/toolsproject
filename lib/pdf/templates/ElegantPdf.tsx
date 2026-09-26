import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const ElegantPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#78350f";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 40,
      backgroundColor: "#fafaf9",
      fontSize: 9,
      fontFamily: "Lora",
      color: "#292524",
      },
    header: {
      textAlign: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#d6d3d1",
      borderBottomStyle: "solid",
      paddingBottom: 12,
      marginBottom: 12,
      alignItems: "center",
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Playfair",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 2,
      color: "#1c1917",
      marginBottom: 3,
    },
    title: {
      fontSize: 9.5,
      fontFamily: "Lora",
      fontStyle: "italic",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: "#57534e",
      marginBottom: 5,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 12,
      fontSize: 8,
      color: "#78716c",
    },
    summary: {
      fontSize: 8.5,
      fontStyle: "italic",
      color: "#44403c",
      textAlign: "center",
      marginTop: 6,
      paddingHorizontal: 20,
      lineHeight: 1.4,
    },
    section: {
      marginBottom: 11,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "Lora",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 2,
      color: accentColor,
      textAlign: "center",
      borderBottomWidth: 0.8,
      borderBottomColor: "#e7e5e4",
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: 7,
    },
    itemBlock: {
      marginBottom: 7,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: 9.5,
      fontFamily: "Playfair",
      fontWeight: 700,
      color: "#1c1917",
    },
    itemSubtitle: {
      fontSize: 8.5,
      fontStyle: "italic",
      color: "#57534e",
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 9,
      color: "#44403c",
      marginTop: 2,
      marginBottom: 3,
    },
    itemDate: {
      fontSize: 8,
      color: "#78716c",
    },
    bulletList: {
      marginLeft: 10,
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
      color: "#44403c",
      },
    skillsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    skillItem: {
      fontSize: 8.5,
      fontStyle: "italic",
      borderBottomWidth: 0.8,
      borderBottomColor: "#d6d3d1",
      borderBottomStyle: "solid",
      paddingBottom: 1.5,
      color: "#44403c",
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
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>"{personalInfo.summary}"</Text> : null}
      </View>

      {/* Sections */}
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
                <Text style={styles.itemSubtitle}>{exp.company} — {exp.location}</Text>
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
            <View style={styles.skillsContainer} wrap={false}>
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
