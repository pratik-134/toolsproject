import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const SimplePdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections } = data;

  const styles = StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 36,
      fontSize: 9,
      fontFamily: "Inter",
      color: "#0f172a",
      },
    header: {
      marginBottom: 10,
    },
    fullName: {
      fontSize: 20,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#020617",
      marginBottom: 2,
    },
    title: {
      fontSize: 10,
      color: "#475569",
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      fontSize: 8,
      color: "#64748b",
    },
    summary: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.4,
      marginTop: 6,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      marginVertical: 10,
    },
    section: {
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#0f172a",
      marginBottom: 5,
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
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
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

  const contactList = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin ? personalInfo.linkedin.replace(/^https?:\/\//, "") : null,
    personalInfo.website ? personalInfo.website.replace(/^https?:\/\//, "") : null,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {contactList.map((item, idx) => (
            <Text key={idx}>
              {item} {idx < contactList.length - 1 ? "•" : ""}
            </Text>
          ))}
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      <View style={styles.divider} />

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.position}, <Text style={{ fontWeight: 400, color: "#475569" }}>{exp.company}</Text>
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
              <View key={edu.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 700 }}>{edu.degree} in {edu.fieldOfStudy}</Text> — {edu.institution}
                </Text>
                <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate}</Text>
              </View>
            ))}

          {section.type === "skills" && (
            <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.bulletText}>
                {(section.items as SkillItem[]).map((s) => s.name).join(" • ")}
              </Text>
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={{ marginBottom: 3 }} wrap={false}>
                <Text style={styles.itemDescription}>
                  <Text style={{ fontWeight: 700 }}>{proj.title}: </Text>
                  {proj.description}
                </Text>
              </View>
            ))}

          {!["experience", "education", "skills", "projects"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 700 }}>{item.title || item.name || item.organization}</Text>
                  {item.description ? ` — ${item.description}` : ""}
                </Text>
                <Text style={styles.itemDate}>{item.date || item.issueDate}</Text>
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
