import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const CompactPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#0284c7";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 24,
      paddingHorizontal: 28,
      fontSize: 8.5,
      fontFamily: "Inter",
      color: "#1e293b",
      },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderBottomWidth: 1,
      borderBottomColor: "#cbd5e1",
      borderBottomStyle: "solid",
      paddingBottom: 6,
      marginBottom: 6,
    },
    headerLeft: {
      flex: 1,
    },
    fullName: {
      fontSize: 18,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
      lineHeight: 1.1,
    },
    title: {
      fontSize: 9,
      fontFamily: "Inter",
      fontWeight: 700,
      color: accentColor,
      marginTop: 1,
    },
    headerRight: {
      alignItems: "flex-end",
      fontSize: 7.5,
      color: "#475569",
    },
    summary: {
      fontSize: 8,
      fontStyle: "italic",
      color: "#475569",
      borderLeftWidth: 2,
      borderLeftColor: accentColor,
      borderLeftStyle: "solid",
      paddingLeft: 6,
      marginBottom: 6,
      lineHeight: 1.3,
    },
    section: {
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 8.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: accentColor,
      borderBottomWidth: 0.8,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 1.5,
      marginBottom: 4,
    },
    itemBlock: {
      marginBottom: 4,
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
      fontSize: 8.5,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#0f172a",
    },
    itemCompany: {
      fontSize: 8.5,
      fontWeight: 400,
      color: "#475569",
    },
    itemDate: {
      fontSize: 7.5,
      color: "#64748b",
    },
    bulletList: {
      marginLeft: 8,
      marginTop: 1,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 1,
    },
    bulletDot: {
      width: 6,
      fontSize: 7.5,
      color: "#64748b",
    },
    bulletText: {
      flex: 1,
      fontSize: 8,
      color: "#334155",
      },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  const contactLine1 = [personalInfo.email, personalInfo.phone].filter(Boolean).join(" • ");
  const contactLine2 = [personalInfo.location, personalInfo.linkedin ? personalInfo.linkedin.replace(/^https?:\/\//, "") : null, personalInfo.website ? personalInfo.website.replace(/^https?:\/\//, "") : null].filter(Boolean).join(" • ");

  return (
    <Page size="A4" style={styles.page}>
      {/* Compact Top Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.fullName}>{personalInfo.fullName || "Your Name"}</Text>
          {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
        </View>
        <View style={styles.headerRight}>
          {contactLine1 ? <Text>{contactLine1}</Text> : null}
          {contactLine2 ? <Text>{contactLine2}</Text> : null}
        </View>
      </View>

      {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.position}, <Text style={styles.itemCompany}>{exp.company}</Text>
                  </Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate}–{exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
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
              <View key={edu.id} style={[styles.itemHeader, { marginBottom: 2 }]} wrap={false}>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 700 }}>{edu.degree}</Text> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""} — {edu.institution} {edu.gpa ? `(GPA ${edu.gpa})` : ""}
                </Text>
                <Text style={styles.itemDate}>{edu.startDate}–{edu.endDate}</Text>
              </View>
            ))}

          {section.type === "skills" && (
            <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={{ fontSize: 8, color: "#334155" }}>
                {(section.items as SkillItem[]).map((s, idx, arr) => (
                  <Text key={s.id}>
                    <Text style={{ fontWeight: 700, color: "#0f172a" }}>{s.name}</Text>
                    {idx < arr.length - 1 ? " • " : ""}
                  </Text>
                ))}
              </Text>
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={{ marginBottom: 2 }} wrap={false}>
                <Text style={styles.itemDescription}>
                  <Text style={{ fontWeight: 700, color: "#0f172a" }}>{proj.title}: </Text>
                  {proj.description}
                </Text>
              </View>
            ))}

          {section.type === "certifications" && (
            <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={{ fontSize: 8, color: "#334155" }}>
                {(section.items as CertificationItem[]).map((c, i, arr) => `${c.name} (${c.issuer})${i < arr.length - 1 ? "; " : ""}`).join("")}
              </Text>
            </View>
          )}

          {section.type === "languages" && (
            <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={{ fontSize: 8, color: "#334155" }}>
                {(section.items as LanguageItem[]).map((l, i, arr) => `${l.language} (${l.fluency})${i < arr.length - 1 ? " • " : ""}`).join("")}
              </Text>
            </View>
          )}

          {!["experience", "education", "skills", "projects", "certifications", "languages"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={[styles.itemHeader, { marginBottom: 2 }]} wrap={false}>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 700 }}>{item.title || item.name || item.organization}</Text>
                  {item.description ? ` — ${item.description}` : ""}
                </Text>
                <Text style={styles.itemDate}>{item.date || item.startDate}</Text>
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
