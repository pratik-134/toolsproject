import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const TwoColumnPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#1e3a8a";

  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      fontSize: 9,
      fontFamily: "Inter",
      color: "#1e293b",
      },
    sidebar: {
      width: "32%",
      backgroundColor: "#f8fafc",
      borderRightWidth: 1,
      borderRightColor: "#e2e8f0",
      borderRightStyle: "solid",
      padding: 24,
    },
    main: {
      width: "68%",
      padding: 28,
    },
    sidebarSectionTitle: {
      fontSize: 9.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#0f172a",
      borderBottomWidth: 1,
      borderBottomColor: "#cbd5e1",
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: 6,
      marginTop: 10,
    },
    mainSectionTitle: {
      fontSize: 10.5,
      fontFamily: "Inter",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: accentColor,
      borderBottomWidth: 1,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: 8,
      marginTop: 10,
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Inter",
      fontWeight: 700,
      color: accentColor,
      marginBottom: 2,
    },
    title: {
      fontSize: 11,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#475569",
      marginBottom: 8,
    },
    summary: {
      fontSize: 8.5,
      color: "#334155",
      lineHeight: 1.4,
      marginBottom: 10,
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
      color: "#475569",
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
      marginLeft: 8,
      marginBottom: 1.5,
    },
    bulletDot: {
      width: 6,
      fontSize: 8,
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5,
      color: "#334155",
      },
    skillBadge: {
      backgroundColor: "#ffffff",
      borderWidth: 0.5,
      borderColor: "#cbd5e1",
      borderStyle: "solid",
      paddingVertical: 1.5,
      paddingHorizontal: 5,
      borderRadius: 2,
      fontSize: 8,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#334155",
      marginBottom: 3,
      marginRight: 3,
    },
  });

  const mainSectionTypes = ["experience", "projects", "awards", "publications"];
  const sidebarSectionTypes = ["education", "skills", "certifications", "languages", "volunteer", "interests", "references", "custom"];

  const mainSections = sections.filter((s) => s.visible && s.items.length > 0 && mainSectionTypes.includes(s.type));
  const sidebarSections = sections.filter((s) => s.visible && s.items.length > 0 && sidebarSectionTypes.includes(s.type));

  return (
    <Page size="A4" style={styles.page}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Contact info */}
        <Text style={[styles.sidebarSectionTitle, { marginTop: 0 }]}>Contact</Text>
        <View style={{ gap: 4, marginBottom: 8 }}>
          {personalInfo.email ? <Text style={{ fontSize: 8 }}>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text style={{ fontSize: 8 }}>{personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text style={{ fontSize: 8 }}>{personalInfo.location}</Text> : null}
          {personalInfo.linkedin ? <Text style={{ fontSize: 8 }}>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</Text> : null}
          {personalInfo.github ? <Text style={{ fontSize: 8 }}>{personalInfo.github.replace(/^https?:\/\//, "")}</Text> : null}
        </View>

        {/* Sidebar sections */}
        {sidebarSections.map((section) => (
          <View key={section.id} wrap={false} style={{ marginBottom: 6 }}>
            <Text style={styles.sidebarSectionTitle}>{section.title}</Text>

            {section.type === "education" &&
              (section.items as EducationItem[]).map((edu) => (
                <View key={edu.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Inter", fontWeight: 700 }}>{edu.degree}</Text>
                  <Text style={{ fontSize: 8, color: "#475569" }}>{edu.institution}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{edu.startDate} – {edu.endDate}</Text>
                </View>
              ))}

            {section.type === "skills" && (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {(section.items as SkillItem[]).map((s) => (
                  <Text key={s.id} style={styles.skillBadge}>{s.name}</Text>
                ))}
              </View>
            )}

            {section.type === "languages" &&
              (section.items as LanguageItem[]).map((l) => (
                <View key={l.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Inter", fontWeight: 700 }}>{l.language}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{l.fluency}</Text>
                </View>
              ))}

            {section.type === "certifications" &&
              (section.items as CertificationItem[]).map((c) => (
                <View key={c.id} style={{ marginBottom: 3 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Inter", fontWeight: 700 }}>{c.name}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{c.issuer}</Text>
                </View>
              ))}
          </View>
        ))}
      </View>

      {/* Main Column */}
      <View style={styles.main}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}
        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}

        {mainSections.map((section) => (
          <View key={section.id} wrap={true} style={{ marginBottom: 10 }}>
            <Text style={styles.mainSectionTitle}>{section.title}</Text>

            {section.type === "experience" &&
              (section.items as ExperienceItem[]).map((exp) => (
                <View key={exp.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `• ${exp.location}` : ""}</Text>
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

            {section.type === "projects" &&
              (section.items as ProjectItem[]).map((proj) => (
                <View key={proj.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{proj.title}</Text>
                    <Text style={styles.itemDate}>{proj.startDate} – {proj.endDate}</Text>
                  </View>
                  {proj.subtitle ? <Text style={styles.itemSubtitle}>{proj.subtitle}</Text> : null}
                  {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
                </View>
              ))}
          </View>
        ))}
      </View>
    </Page>
  );
};
