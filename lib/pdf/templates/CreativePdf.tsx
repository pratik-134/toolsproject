import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const CreativePdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#ec4899";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 28,
      paddingHorizontal: 32,
      fontSize: 9,
      fontFamily: "Poppins",
      color: "#1e293b",
      },
    headerCard: {
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderStyle: "solid",
      borderRadius: 8,
      padding: 14,
      marginBottom: 12,
    },
    tagline: {
      fontSize: 8,
      fontFamily: "Poppins",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: "#64748b",
      marginBottom: 2,
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#0f172a",
      lineHeight: 1.1,
    },
    title: {
      fontSize: 10.5,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: accentColor,
      marginTop: 2,
      marginBottom: 6,
    },
    contactBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 4,
    },
    contactBadge: {
      backgroundColor: "#ffffff",
      borderWidth: 0.8,
      borderColor: "#cbd5e1",
      borderStyle: "solid",
      borderRadius: 10,
      paddingVertical: 2,
      paddingHorizontal: 7,
      fontSize: 8,
      color: "#475569",
    },
    summary: {
      fontSize: 8.5,
      color: "#475569",
      lineHeight: 1.4,
      borderTopWidth: 0.8,
      borderTopColor: "#e2e8f0",
      borderTopStyle: "solid",
      paddingTop: 6,
      marginTop: 6,
    },
    section: {
      marginBottom: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    sectionSquare: {
      width: 6,
      height: 6,
      backgroundColor: accentColor,
      marginRight: 6,
      borderRadius: 1,
    },
    sectionTitle: {
      fontSize: 9.5,
      fontFamily: "Poppins",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#0f172a",
    },
    sectionLine: {
      flex: 1,
      borderBottomWidth: 0.8,
      borderBottomColor: "#f1f5f9",
      borderBottomStyle: "solid",
      marginLeft: 8,
    },
    expCard: {
      borderWidth: 0.8,
      borderColor: "#e2e8f0",
      borderStyle: "solid",
      borderRadius: 6,
      padding: 8,
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
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#0f172a",
    },
    datePill: {
      fontSize: 7.5,
      backgroundColor: "#f1f5f9",
      paddingVertical: 1.5,
      paddingHorizontal: 6,
      borderRadius: 6,
      color: "#475569",
    },
    itemCompany: {
      fontSize: 8.5,
      color: "#64748b",
      marginTop: 1,
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
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    skillPill: {
      backgroundColor: accentColor,
      borderRadius: 10,
      paddingVertical: 2.5,
      paddingHorizontal: 8,
      fontSize: 8,
      fontFamily: "Poppins",
      fontWeight: 700,
      color: "#ffffff",
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Creative Header */}
      <View style={styles.headerCard}>
        <Text style={styles.tagline}>• Portfolio & Resume</Text>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactBadges}>
          {personalInfo.email ? <Text style={styles.contactBadge}>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text style={styles.contactBadge}>{personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text style={styles.contactBadge}>{personalInfo.location}</Text> : null}
          {personalInfo.website ? <Text style={styles.contactBadge}>{personalInfo.website.replace(/^https?:\/\//, "")}</Text> : null}
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionSquare} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionLine} />
          </View>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.expCard} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.position}</Text>
                  <Text style={styles.datePill}>
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
              <View key={edu.id} style={[styles.expCard, { padding: 6 }]} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <Text style={{ fontSize: 8.5, color: "#475569" }}>{edu.institution} {edu.gpa ? `• GPA ${edu.gpa}` : ""}</Text>
              </View>
            ))}

          {section.type === "skills" && (
            <View style={styles.skillsRow} wrap={false}>
              {(section.items as SkillItem[]).map((s) => (
                <Text key={s.id} style={styles.skillPill}>{s.name}</Text>
              ))}
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={[styles.expCard, { backgroundColor: "#f8fafc" }]} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{proj.startDate} – {proj.endDate}</Text>
                </View>
                {proj.subtitle ? <Text style={{ fontSize: 8, fontStyle: "italic", color: "#64748b" }}>{proj.subtitle}</Text> : null}
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {section.type === "certifications" &&
            (section.items as CertificationItem[]).map((c) => (
              <View key={c.id} style={[styles.itemHeader, { borderBottomWidth: 0.8, borderBottomColor: "#f1f5f9", paddingBottom: 2, marginBottom: 3 }]} wrap={false}>
                <Text style={{ fontSize: 8.5, fontFamily: "Poppins", fontWeight: 700, color: "#1e293b" }}>{c.name} ({c.issuer})</Text>
                <Text style={{ fontSize: 8, color: "#64748b" }}>{c.issueDate}</Text>
              </View>
            ))}

          {section.type === "languages" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }} wrap={false}>
              {(section.items as LanguageItem[]).map((l) => (
                <View key={l.id} style={{ backgroundColor: "#f1f5f9", borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 8, color: "#334155" }}>
                    <Text style={{ fontWeight: 700 }}>{l.language}</Text>: {l.fluency}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {!["experience", "education", "skills", "projects", "certifications", "languages"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={{ fontSize: 8.5, fontFamily: "Poppins", fontWeight: 700 }}>{item.title || item.name || item.organization}</Text>
                <Text style={{ fontSize: 8, color: "#64748b" }}>{item.date || item.startDate}</Text>
              </View>
            ))}
        </View>
      ))}
    </Page>
  );
};
