import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const TechPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#2563eb";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 36,
      fontSize: 9,
      fontFamily: "JetBrainsMono",
      color: "#1e293b",
      },
    header: {
      borderBottomWidth: 1.5,
      borderBottomColor: "#0f172a",
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: 12,
    },
    promptLine: {
      fontSize: 8,
      color: "#64748b",
      marginBottom: 3,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 4,
    },
    fullName: {
      fontSize: 20,
      fontFamily: "JetBrainsMono",
      fontWeight: 700,
      color: "#020617",
    },
    roleBadge: {
      fontSize: 8.5,
      fontFamily: "JetBrainsMono",
      fontWeight: 700,
      color: accentColor,
      backgroundColor: "#eff6ff",
      paddingVertical: 1.5,
      paddingHorizontal: 6,
      borderRadius: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      fontSize: 8,
      color: "#475569",
      marginTop: 2,
    },
    summaryBox: {
      borderLeftWidth: 2,
      borderLeftColor: accentColor,
      borderLeftStyle: "solid",
      paddingLeft: 6,
      marginTop: 6,
    },
    summaryText: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.4,
    },
    section: {
      marginBottom: 11,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    sectionDollar: {
      fontSize: 8.5,
      fontWeight: 700,
      color: accentColor,
      marginRight: 4,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "JetBrainsMono",
      fontWeight: 700,
      textTransform: "uppercase",
      color: "#0f172a",
    },
    sectionDotted: {
      flex: 1,
      borderBottomWidth: 0.8,
      borderBottomColor: "#cbd5e1",
      borderBottomStyle: "dashed",
      marginLeft: 6,
    },
    itemBlock: {
      marginBottom: 7,
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
    itemPosition: {
      fontSize: 9.5,
      fontFamily: "JetBrainsMono",
      fontWeight: 700,
      color: "#0f172a",
    },
    itemCompany: {
      fontSize: 9,
      color: "#475569",
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
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5,
      color: "#334155",
      },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillBadge: {
      backgroundColor: "#f1f5f9",
      borderWidth: 0.8,
      borderColor: "#e2e8f0",
      borderStyle: "solid",
      paddingVertical: 1.5,
      paddingHorizontal: 5,
      borderRadius: 2,
      fontSize: 8,
      color: "#1e293b",
    },
    projectCard: {
      borderWidth: 0.8,
      borderColor: "#e2e8f0",
      borderStyle: "solid",
      backgroundColor: "#f8fafc",
      padding: 6,
      borderRadius: 3,
      marginBottom: 5,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 3,
    },
    tagBadge: {
      fontSize: 7.5,
      color: "#475569",
      backgroundColor: "#e2e8f0",
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 2,
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Dev Header */}
      <View style={styles.header}>
        <Text style={styles.promptLine}>&gt; whoami --verbose</Text>

        <View style={styles.titleRow}>
          <Text style={styles.fullName}>{personalInfo.fullName || "alex_rivera"}</Text>
          {personalInfo.title ? (
            <Text style={styles.roleBadge}>&lt;{personalInfo.title} /&gt;</Text>
          ) : null}
        </View>

        <View style={styles.contactRow}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>• {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>• {personalInfo.location}</Text> : null}
          {personalInfo.github ? <Text>• gh:{personalInfo.github.replace(/^https?:\/\//, "")}</Text> : null}
          {personalInfo.website ? <Text>• web:{personalInfo.website.replace(/^https?:\/\//, "")}</Text> : null}
        </View>

        {personalInfo.summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        ) : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionDollar}>$</Text>
            <Text style={styles.sectionTitle}>{section.title}.log</Text>
            <View style={styles.sectionDotted} />
          </View>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPosition}>
                    {exp.position} <Text style={styles.itemCompany}>@ {exp.company}</Text>
                  </Text>
                  <Text style={styles.itemDate}>
                    [{exp.startDate} – {exp.current ? "HEAD" : exp.endDate}]
                  </Text>
                </View>
                {exp.description ? (
                  <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text>
                ) : null}
                {exp.highlights && exp.highlights.length > 0 ? (
                  <View style={styles.bulletList}>
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>-</Text>
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
                  <Text style={styles.itemPosition}>
                    {edu.degree} in {edu.fieldOfStudy}
                  </Text>
                  <Text style={styles.itemDate}>[{edu.startDate} – {edu.endDate}]</Text>
                </View>
                <Text style={styles.itemCompany}>{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</Text>
              </View>
            ))}

          {section.type === "skills" && (
            <View style={styles.skillsContainer} wrap={false}>
              {(section.items as SkillItem[]).map((s) => (
                <Text key={s.id} style={styles.skillBadge}>{s.name}</Text>
              ))}
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={styles.projectCard} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPosition}>{proj.title}</Text>
                  <Text style={styles.itemDate}>[{proj.startDate} – {proj.endDate}]</Text>
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
                {proj.technologies && proj.technologies.length > 0 ? (
                  <View style={styles.tagRow}>
                    {proj.technologies.map((t, idx) => (
                      <Text key={idx} style={styles.tagBadge}>#{t}</Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}

          {section.type === "certifications" &&
            (section.items as CertificationItem[]).map((c) => (
              <View key={c.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={{ fontSize: 8.5 }}>{c.name} ({c.issuer})</Text>
                <Text style={styles.itemDate}>{c.issueDate}</Text>
              </View>
            ))}

          {section.type === "languages" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }} wrap={false}>
              {(section.items as LanguageItem[]).map((l) => (
                <Text key={l.id} style={{ fontSize: 8.5 }}>
                  <Text style={{ fontWeight: 700 }}>{l.language}</Text>: {l.fluency}
                </Text>
              ))}
            </View>
          )}

          {!["experience", "education", "skills", "projects", "certifications", "languages"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemPosition}>{item.title || item.name || item.organization}</Text>
                  <Text style={styles.itemDate}>{item.date || item.startDate}</Text>
                </View>
                {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
