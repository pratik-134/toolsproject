import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, PublicationItem } from "@/lib/schema";
import { registerPdfFonts } from "../fonts";

registerPdfFonts();

export const AcademicPdf: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const accentColor = theme?.accentColor || "#0f172a";

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
      borderBottomColor: "#0f172a",
      borderBottomStyle: "solid",
      paddingBottom: 10,
      marginBottom: 12,
      alignItems: "center",
    },
    fullName: {
      fontSize: 22,
      fontFamily: "Lora",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: "#0f172a",
      marginBottom: 2,
    },
    title: {
      fontSize: 10.5,
      fontStyle: "italic",
      color: "#334155",
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 10,
      fontSize: 8.5,
      color: "#475569",
    },
    section: {
      marginBottom: 11,
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
      marginBottom: 6,
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
    itemDegree: {
      fontSize: 9.5,
      fontFamily: "Lora",
      fontWeight: 700,
      color: "#0f172a",
    },
    itemInstitution: {
      fontSize: 9,
      fontStyle: "italic",
      color: "#334155",
    },
    itemDate: {
      fontSize: 8.5,
      color: "#475569",
    },
    bulletText: {
      fontSize: 8.5,
      color: "#334155",
      },
    publicationItem: {
      marginBottom: 4,
      paddingLeft: 12,
    },
  });

  const activeSections = [...sections]
    .filter((s) => s.visible && s.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Curriculum Vitae Header */}
      <View style={styles.header}>
        <Text style={styles.fullName}>{personalInfo.fullName || "Curriculum Vitae"}</Text>
        {personalInfo.title ? <Text style={styles.title}>{personalInfo.title}</Text> : null}

        <View style={styles.contactRow}>
          {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
          {personalInfo.email ? <Text>• Email: {personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>• Tel: {personalInfo.phone}</Text> : null}
          {personalInfo.website ? <Text>• Web: {personalInfo.website.replace(/^https?:\/\//, "")}</Text> : null}
        </View>
      </View>

      {/* Sections */}
      {activeSections.map((section) => (
        <View key={section.id} style={styles.section} wrap={true}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {/* Academic CV prioritizes Education */}
          {section.type === "education" &&
            (section.items as EducationItem[]).map((edu) => (
              <View key={edu.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDegree}>
                    {edu.degree} in {edu.fieldOfStudy}, <Text style={styles.itemInstitution}>{edu.institution}</Text>
                  </Text>
                  <Text style={styles.itemDate}>{edu.endDate || edu.startDate}</Text>
                </View>
                {edu.honors ? <Text style={{ fontSize: 8.5, color: "#64748b" }}>Honors: {edu.honors}</Text> : null}
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}

          {section.type === "experience" &&
            (section.items as ExperienceItem[]).map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDegree}>{exp.position}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.itemInstitution}>{exp.company}, {exp.location}</Text>
                {exp.description ? <Text style={styles.itemDescription}>{exp.description.replace(/<[^>]*>/g, "")}</Text> : null}
              </View>
            ))}

          {section.type === "publications" &&
            (section.items as PublicationItem[]).map((pub) => (
              <View key={pub.id} style={styles.publicationItem} wrap={false}>
                <Text style={styles.bulletText}>
                  "{pub.title}". <Text style={{ fontStyle: "italic" }}>{pub.publisher}</Text> ({pub.date}).
                </Text>
                {pub.url ? <Text style={{ fontSize: 8, color: "#2563eb", marginTop: 1 }}>{pub.url}</Text> : null}
              </View>
            ))}

          {section.type === "skills" && (
            <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.bulletText}>
                <Text style={{ fontFamily: "Lora", fontWeight: 700 }}>Research & Methodologies: </Text>
                {(section.items as SkillItem[]).map((s) => s.name).join(", ")}
              </Text>
            </View>
          )}

          {section.type === "projects" &&
            (section.items as ProjectItem[]).map((proj) => (
              <View key={proj.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDegree}>{proj.title}</Text>
                  <Text style={styles.itemDate}>{proj.startDate} – {proj.endDate}</Text>
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}

          {!["experience", "education", "publications", "skills", "projects"].includes(section.type) &&
            section.items.map((item: any) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDegree}>{item.title || item.name || item.organization}</Text>
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
