/**
 * Estimate & Quote Builder — Pure Domain Logic
 * 100% In-Browser Execution (Zero Network Uploads)
 */

export interface QuoteItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  unit: "hours" | "days" | "fixed" | "units";
  rate: number;
}

export interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  validUntilDate: string;
  currency: string;
  currencySymbol: string;
  sender: {
    name: string;
    company: string;
    email: string;
    address: string;
    phone?: string;
  };
  client: {
    name: string;
    company: string;
    email: string;
    address: string;
  };
  projectTitle: string;
  projectScope: string;
  items: QuoteItem[];
  discountPercent: number;
  taxRatePercent: number;
  terms: string;
}

export interface QuoteTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export const DEFAULT_QUOTE: QuoteData = {
  quoteNumber: "EST-2026-104",
  issueDate: new Date().toISOString().substring(0, 10),
  validUntilDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
  currency: "USD",
  currencySymbol: "$",
  projectTitle: "Next.js Web Portal Redesign & Performance Optimization",
  projectScope:
    "End-to-end technical discovery, responsive Tailwind UI implementation, client-side caching architecture, and Core Web Vitals audit.",
  sender: {
    name: "Elena Rostova",
    company: "Apex Technical Consulting",
    email: "elena@apextech.dev",
    address: "500 Howard Street, Suite 300, San Francisco, CA",
    phone: "+1 (415) 555-0182",
  },
  client: {
    name: "Marcus Vance",
    company: "Vance Enterprises Inc.",
    email: "procurement@vance-corp.com",
    address: "1200 Avenue of the Americas, New York, NY",
  },
  items: [
    {
      id: "quote-1",
      service: "Discovery & System Architecture Plan",
      description: "Codebase audit, dependency review, and performance benchmark strategy.",
      quantity: 16,
      unit: "hours",
      rate: 150,
    },
    {
      id: "quote-2",
      service: "Frontend Engineering & Component Migration",
      description: "Migration to Next.js App Router, SSR/SSG caching, and dark mode design system.",
      quantity: 40,
      unit: "hours",
      rate: 140,
    },
    {
      id: "quote-3",
      service: "Lighthouse 100/100 Speed & Accessibility Optimization",
      description: "CLS zeroing, script tree-shaking, and responsive mobile testing.",
      quantity: 12,
      unit: "hours",
      rate: 140,
    },
  ],
  discountPercent: 5,
  taxRatePercent: 0,
  terms:
    "1. Quote valid for 30 calendar days from issue date.\n2. 50% deposit required upon project commencement, balance on completion.\n3. Changes to project scope will be quoted as separate addenda.",
};

export function calculateQuoteItemTotal(quantity: number, rate: number): number {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);
  return Math.round(safeQty * safeRate * 100) / 100;
}

export function calculateQuoteTotals(
  items: QuoteItem[],
  taxRatePercent: number = 0,
  discountPercent: number = 0
): QuoteTotals {
  const subtotal = items.reduce((acc, it) => acc + calculateQuoteItemTotal(it.quantity, it.rate), 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  const safeDiscount = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discountAmount = Math.round(((roundedSubtotal * safeDiscount) / 100) * 100) / 100;

  const taxableAmount = Math.max(0, roundedSubtotal - discountAmount);
  const safeTax = Math.max(0, Math.min(100, Number(taxRatePercent) || 0));
  const taxAmount = Math.round(((taxableAmount * safeTax) / 100) * 100) / 100;

  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
}

export function validateQuote(quote: Partial<QuoteData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!quote.quoteNumber?.trim()) errors.push("Quote number is required.");
  if (!quote.projectTitle?.trim()) errors.push("Project title is required.");
  if (!quote.sender?.company?.trim() && !quote.sender?.name?.trim()) {
    errors.push("Sender company or name is required.");
  }
  if (!quote.client?.company?.trim() && !quote.client?.name?.trim()) {
    errors.push("Client company or name is required.");
  }
  if (!quote.items || quote.items.length === 0) {
    errors.push("At least one line item is required.");
  }
  return { valid: errors.length === 0, errors };
}
