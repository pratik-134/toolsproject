/**
 * Invoice & Receipt Generator — Pure Domain Logic
 * 100% In-Browser Execution (Zero Network Uploads)
 */

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceParty {
  name: string;
  company: string;
  email: string;
  address: string;
  phone?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  sender: InvoiceParty;
  client: InvoiceParty;
  items: InvoiceItem[];
  taxRatePercent: number; // e.g. 10 for 10%
  discountPercent: number; // e.g. 5 for 5%
  notes: string;
  logoUrl?: string;
  template: "modern" | "corporate" | "minimal";
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
};

export const DEFAULT_INVOICE: InvoiceData = {
  invoiceNumber: "INV-2026-001",
  issueDate: new Date().toISOString().substring(0, 10),
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
  currency: "USD",
  currencySymbol: "$",
  sender: {
    name: "Alex Morgan",
    company: "Studio Morgan LLC",
    email: "alex@studiomorgan.design",
    address: "742 Evergreen Terrace, Suite 100, Austin, TX",
    phone: "+1 (512) 555-0199",
  },
  client: {
    name: "Sarah Jenkins",
    company: "Apex Global Ventures",
    email: "accounting@apexventures.io",
    address: "100 Innovation Blvd, 4th Floor, San Francisco, CA",
  },
  items: [
    {
      id: "item-1",
      description: "Frontend Web Application UI/UX Design (Figma Prototype)",
      quantity: 1,
      rate: 2400,
    },
    {
      id: "item-2",
      description: "Client-Side Next.js & Tailwind Component Integration",
      quantity: 32,
      rate: 85,
    },
    {
      id: "item-3",
      description: "Design System Tokens & Accessibility QA Audit",
      quantity: 1,
      rate: 650,
    },
  ],
  taxRatePercent: 8,
  discountPercent: 5,
  notes: "Payment due within 14 days of issue date. Bank transfer or ACH preferred. Thank you for your business!",
  template: "modern",
};

/**
 * Calculates line item total
 */
export function calculateLineTotal(quantity: number, rate: number): number {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);
  return Math.round(safeQty * safeRate * 100) / 100;
}

/**
 * Calculates comprehensive invoice financial totals
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxRatePercent: number = 0,
  discountPercent: number = 0
): InvoiceTotals {
  const safeTax = Math.max(0, Math.min(100, Number(taxRatePercent) || 0));
  const safeDiscount = Math.max(0, Math.min(100, Number(discountPercent) || 0));

  const subtotal = items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.rate);
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const discountAmount = Math.round(((roundedSubtotal * safeDiscount) / 100) * 100) / 100;
  const taxableAmount = Math.max(0, roundedSubtotal - discountAmount);
  const taxAmount = Math.round(((taxableAmount * safeTax) / 100) * 100) / 100;
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
    itemCount: items.length,
  };
}

/**
 * Formats a currency amount into localized string
 */
export function formatCurrency(amount: number, symbol: string = "$"): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${symbol}${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validates invoice data integrity
 */
export function validateInvoice(invoice: Partial<InvoiceData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!invoice.invoiceNumber?.trim()) errors.push("Invoice number is required.");
  if (!invoice.sender?.name?.trim()) errors.push("Sender name is required.");
  if (!invoice.client?.name?.trim()) errors.push("Client name is required.");
  if (!invoice.items || invoice.items.length === 0) errors.push("At least one line item is required.");
  return {
    valid: errors.length === 0,
    errors,
  };
}
