import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";
import { getComputedResumeLayout } from "@/lib/resume-layout";

registerPdfFonts();

export const AtsSafePdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const layout = getComputedResumeLayout(theme);

  const styles = StyleSheet.create({
    page: {
      ...layout.pdf.pageStyle,
      color: "#000000",
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      borderBottomStyle: "solid",
      paddingBottom: 8,
      marginBottom: layout.density.headerMarginBottomPt,
      alignItems: "center",
      textAlign: "center",
    },
    fullName: {
      fontSize: layout.density.fontSize.namePt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: "#000000",
      marginBottom: 2,
    },
    title: {
      fontSize: layout.density.fontSize.titlePt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#000000",
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 6,
      fontSize: layout.density.fontSize.captionPt,
      color: "#000000",
    },
    summary: {
      fontSize: layout.density.fontSize.bodyPt,
      color: "#111111",
      textAlign: "left",
      lineHeight: layout.density.lineHeight,
      marginTop: 6,
      width: "100%",
    },
    section: {
      marginBottom: layout.density.sectionSpacingPt,
    },
    sectionTitle: {
      fontSize: layout.density.fontSize.sectionHeadingPt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      borderBottomStyle: "solid",
      paddingBottom: 2,
      marginBottom: layout.density.itemSpacingPt,
    },
    itemBlock: {
      marginBottom: layout.density.itemSpacingPt,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: layout.density.fontSize.itemTitlePt,
      fontFamily: layout.fonts.pdfPrimaryFont,
      fontWeight: 700,
      color: "#000000",
    },
    itemDate: {
      fontSize: layout.density.fontSize.captionPt,
      color: "#000000",
    },
    itemSubtitle: {
      fontSize: layout.density.fontSize.itemSubtitlePt,
      color: "#222222",
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: layout.density.fontSize.bodyPt,
      color: "#000000",
      marginTop: 2,
      marginBottom: layout.density.bulletSpacingPt,
    },
    bulletList: {
      marginLeft: 6,
      marginTop: layout.density.bulletSpacingPt,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: layout.density.bulletSpacingPt,
    },
    bulletDot: {
      width: 10,
      fontSize: layout.density.fontSize.bodyPt,
      color: "#000000",
    },
    bulletText: {
      flex: 1,
      fontSize: layout.density.fontSize.bodyPt,
      color: "#000000",
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  const contactItems = [
    personalInfo.location,
    personalInfo.phone,
    personalInfo.email,
    personalInfo.linkedin ? personalInfo.linkedin.replace(/^https?:\/\//, "") : null,
    personalInfo.website ? personalInfo.website.replace(/^https?:\/\//, "") : null,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      {/* ATS Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {contactItems.map((item, idx) => (
            <Text key={idx}>
              {item} {idx < contactItems.length - 1 ? " | " : ""}
            </Text>
          ))}
        </View>

        {personalInfo.summary ? <Text style={styles.summary}>{personalInfo.summary}</Text> : null}
      </View>

      {/* Strict Linear ATS Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.company}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemSubtitle}>{exp.position}</Text>
                  {exp.location ? <Text style={{ fontSize: 8.5, color: "#333333" }}>{exp.location}</Text> : null}
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
              <View key={edu.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.institution}</Text>
                  <Text style={styles.itemDate}>
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </Text>
                </View>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemSubtitle}>
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                  </Text>
                  {edu.location ? <Text style={{ fontSize: 8.5, color: "#333333" }}>{edu.location}</Text> : null}
                </View>
                {edu.gpa ? <Text style={{ fontSize: 8.5, color: "#333333" }}>GPA: {edu.gpa}</Text> : null}
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}

          {section.type === "skills" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }} wrap={false}>
              <Text style={{ fontSize: 9 }}>
                <Text style={{ fontFamily: "Inter", fontWeight: 700 }}>Skills: </Text>
                {(section.items as SkillItem[]).map((s) => s.name).join(", ")}
              </Text>
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  <Text style={styles.itemDate}>{proj.startDate} - {proj.endDate}</Text>
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {section.type === "certifications" &&
            (section.items as CertificationItem[]).map((c) => (
              <View key={c.id} style={[styles.itemHeader, { marginBottom: 3 }]} wrap={false}>
                <Text style={styles.itemTitle}>{c.name} - {c.issuer}</Text>
                <Text style={styles.itemDate}>{c.issueDate}</Text>
              </View>
            ))}

          {section.type === "languages" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }} wrap={false}>
              <Text style={{ fontSize: 9 }}>
                <Text style={{ fontFamily: "Inter", fontWeight: 700 }}>Languages: </Text>
                {(section.items as LanguageItem[]).map((l, i, arr) => `${l.language} (${l.fluency})${i < arr.length - 1 ? ", " : ""}`).join("")}
              </Text>
            </View>
          )}

          {!["experience", "education", "skills", "projects", "certifications", "languages"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title || item.name || item.organization}</Text>
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
