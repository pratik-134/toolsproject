/**
 * Certificate & Diploma Generator — Pure Domain Logic
 * 100% In-Browser Execution (Zero Network Uploads)
 */

export type CertificateTemplate = "classic-gold" | "modern-minimal" | "tech-achievement" | "royal-navy";

export interface CertificateData {
  recipientName: string;
  courseTitle: string;
  achievementDescription: string;
  organizationName: string;
  organizationSubtext: string;
  issueDate: string;
  certificateId: string;
  signatoryName: string;
  signatoryTitle: string;
  signatureUrl?: string;
  template: CertificateTemplate;
  accentColor: string;
}

export const CERTIFICATE_TEMPLATES: { id: CertificateTemplate; name: string; description: string }[] = [
  {
    id: "classic-gold",
    name: "Classic Gold & Serif",
    description: "Traditional ornate border with gold filigree and regal typography.",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    description: "Clean geometric framing, elegant spacing, and contemporary sans-serif fonts.",
  },
  {
    id: "tech-achievement",
    name: "Tech & Engineering",
    description: "Futuristic slate grid, neon accent lines, and digital verification stamp.",
  },
  {
    id: "royal-navy",
    name: "Royal Navy Crest",
    description: "Prestigious deep navy background with silver lettering and formal seal.",
  },
];

export const DEFAULT_CERTIFICATE: CertificateData = {
  recipientName: "Alexander James Hayes",
  courseTitle: "Full-Stack System Architecture & Next.js Mastery",
  achievementDescription:
    "For successfully completing 120 hours of advanced curriculum, demonstrating proficiency in TypeScript, client-side web workers, and high-performance WebAssembly architectures.",
  organizationName: "Global Institute of Software Engineering",
  organizationSubtext: "Accredited Technical Certification Board",
  issueDate: new Date().toISOString().substring(0, 10),
  certificateId: "CERT-2026-8849",
  signatoryName: "Dr. Marcus Vance, Ph.D.",
  signatoryTitle: "Dean of Technical Education & Computing",
  template: "classic-gold",
  accentColor: "#d97706",
};

/**
 * Generates an authentic verification certificate ID hash
 */
export function generateCertificateId(prefix: string = "CERT"): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${random}`;
}

/**
 * Validates certificate data
 */
export function validateCertificate(data: Partial<CertificateData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.recipientName?.trim()) errors.push("Recipient name is required.");
  if (!data.courseTitle?.trim()) errors.push("Course or achievement title is required.");
  if (!data.organizationName?.trim()) errors.push("Organization name is required.");
  if (!data.signatoryName?.trim()) errors.push("Signatory name is required.");
  return { valid: errors.length === 0, errors };
}
