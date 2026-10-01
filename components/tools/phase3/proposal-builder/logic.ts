/**
 * Proposal Builder — Pure Domain Logic
 * 100% In-Browser Execution (Zero Network Uploads)
 */

export interface ProposalPricingItem {
  id: string;
  item: string;
  description: string;
  qty: number;
  rate: number;
}

export interface ProposalMilestone {
  id: string;
  phase: string;
  duration: string;
  deliverables: string;
}

export interface ProposalData {
  proposalTitle: string;
  proposalSubtitle: string;
  preparedFor: {
    clientName: string;
    clientCompany: string;
    email: string;
  };
  preparedBy: {
    authorName: string;
    agencyCompany: string;
    email: string;
  };
  date: string;
  validUntil: string;
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  milestones: ProposalMilestone[];
  pricing: ProposalPricingItem[];
  currencySymbol: string;
  terms: string;
}

export const DEFAULT_PROPOSAL: ProposalData = {
  proposalTitle: "Enterprise Web Platform Modernization",
  proposalSubtitle: "Strategic Architecture, Client-Side Performance & SEO Revamp",
  preparedFor: {
    clientName: "David Sterling",
    clientCompany: "Sterling Industrial Holdings",
    email: "d.sterling@sterling-holdings.com",
  },
  preparedBy: {
    authorName: "Morgan Vance",
    agencyCompany: "Vance Technical Architecture Studio",
    email: "morgan@vancestudio.dev",
  },
  date: new Date().toISOString().substring(0, 10),
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
  executiveSummary:
    "Sterling Industrial requires a modern, high-speed digital platform that consolidates 150+ internal tool workflows with zero server latency and maximum data privacy compliance. Our proposal details the migration architecture, phase delivery schedule, and pricing.",
  problemStatement:
    "Current legacy systems incur high server compute overhead, slow page load speeds (Lighthouse < 45), and raise security concerns regarding user file uploads.",
  proposedSolution:
    "Architect an App Router Next.js platform executing 100% in-browser WebAssembly pipelines, reducing backend server hosting costs by 80% while elevating SEO ranking.",
  milestones: [
    {
      id: "m-1",
      phase: "Phase 1: Architecture Discovery",
      duration: "Weeks 1 - 2",
      deliverables: "Security audit, Figma design token sync, data flow specs.",
    },
    {
      id: "m-2",
      phase: "Phase 2: Core Engineering",
      duration: "Weeks 3 - 6",
      deliverables: "Next.js migration, Web Worker pipeline, responsive UI shell.",
    },
    {
      id: "m-3",
      phase: "Phase 3: QA & Production Launch",
      duration: "Weeks 7 - 8",
      deliverables: "Lighthouse 100 benchmark, multi-browser QA, seamless DNS cutover.",
    },
  ],
  pricing: [
    {
      id: "p-1",
      item: "Technical Discovery & Architecture Strategy",
      description: "Discovery sprint, security audit, and dependency roadmap.",
      qty: 1,
      rate: 3500,
    },
    {
      id: "p-2",
      item: "Full-Stack Next.js Frontend Implementation",
      description: "App router, dark mode tokens, and 100% client sandbox.",
      qty: 1,
      rate: 8500,
    },
    {
      id: "p-3",
      item: "Performance, Accessibility & SEO Optimization",
      description: "Lighthouse 100 audit, schema markup, and WCAG AA verification.",
      qty: 1,
      rate: 2200,
    },
  ],
  currencySymbol: "$",
  terms:
    "1. 40% initial retainer due on signing, 30% at Phase 2 completion, 30% upon final production sign-off.\n2. Invoices are payable within 14 business days.",
};

export function calculateProposalTotal(pricing: ProposalPricingItem[]): number {
  return pricing.reduce((sum, item) => {
    const q = Math.max(0, Number(item.qty) || 0);
    const r = Math.max(0, Number(item.rate) || 0);
    return sum + q * r;
  }, 0);
}

export function validateProposal(data: Partial<ProposalData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.proposalTitle?.trim()) errors.push("Proposal title is required.");
  if (!data.preparedFor?.clientName?.trim()) errors.push("Client contact name is required.");
  if (!data.preparedBy?.agencyCompany?.trim() && !data.preparedBy?.authorName?.trim()) {
    errors.push("Prepared by name or agency is required.");
  }
  if (!data.pricing || data.pricing.length === 0) {
    errors.push("At least one pricing item is required.");
  }
  return { valid: errors.length === 0, errors };
}
