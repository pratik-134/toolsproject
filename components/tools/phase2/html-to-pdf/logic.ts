/**
 * HTML to PDF — In-Browser Pure Logic
 * Print CSS injection, document structure validation, and starter templates.
 */

export interface PrintOptions {
  pageSize: "A4" | "Letter" | "Legal";
  margin: "normal" | "narrow" | "wide" | "none";
}

export const TEMPLATES: Record<string, { name: string; html: string }> = {
  invoice: {
    name: "Professional Invoice",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #INV-2026-001</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .inv-details { text-align: right; font-size: 14px; color: #64748b; }
    .bill-to { margin-top: 30px; font-size: 14px; }
    .bill-to strong { font-size: 16px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 14px; }
    th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #475569; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .total-box { margin-top: 30px; float: right; width: 250px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .total-final { font-size: 18px; font-weight: bold; color: #0f172a; border-top: 2px solid #0f172a; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">ACME Corporation</div>
      <p style="color: #64748b; font-size: 13px; margin: 4px 0;">100 Innovation Way, Suite 400<br>San Francisco, CA 94105</p>
    </div>
    <div class="inv-details">
      <h2 style="margin: 0; color: #0f172a;">INVOICE</h2>
      <p style="margin: 4px 0;"><strong>Invoice #:</strong> INV-2026-001</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> October 15, 2026</p>
      <p style="margin: 4px 0;"><strong>Due Date:</strong> November 15, 2026</p>
    </div>
  </div>

  <div class="bill-to">
    <p style="color: #64748b; margin: 0 0 4px 0;">Billed To:</p>
    <strong>Globex Technologies LLC</strong><br>
    742 Evergreen Terrace<br>
    Springfield, OR 97477
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Hours</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Full-Stack Cloud Architecture Consulting</td>
        <td style="text-align: center;">40</td>
        <td style="text-align: right;">$150.00</td>
        <td style="text-align: right;">$6,000.00</td>
      </tr>
      <tr>
        <td>Security Audit & Client-Side Sandboxing</td>
        <td style="text-align: center;">25</td>
        <td style="text-align: right;">$160.00</td>
        <td style="text-align: right;">$4,000.00</td>
      </tr>
      <tr>
        <td>Automated Testing & CI Pipeline Configuration</td>
        <td style="text-align: center;">15</td>
        <td style="text-align: right;">$140.00</td>
        <td style="text-align: right;">$2,100.00</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row"><span>Subtotal:</span><span>$12,100.00</span></div>
    <div class="total-row"><span>Tax (0%):</span><span>$0.00</span></div>
    <div class="total-row total-final"><span>Total Due:</span><span>$12,100.00</span></div>
  </div>
</body>
</html>`,
  },
  certificate: {
    name: "Certificate of Achievement",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate of Achievement</title>
  <style>
    body { font-family: "Georgia", serif; text-align: center; padding: 40px; margin: 0; background: #fff; }
    .cert-border { border: 8px double #1e3a8a; padding: 40px 30px; border-radius: 8px; }
    .gold-seal { color: #d97706; font-size: 14px; text-transform: uppercase; letter-spacing: 4px; font-weight: bold; margin-bottom: 20px; }
    h1 { font-size: 36px; color: #1e3a8a; margin: 0 0 10px 0; font-weight: normal; }
    p.subtitle { font-size: 16px; color: #64748b; font-style: italic; margin-bottom: 30px; }
    .recipient { font-size: 32px; font-family: -apple-system, sans-serif; font-weight: bold; color: #0f172a; border-bottom: 2px solid #cbd5e1; display: inline-block; padding-bottom: 8px; min-width: 350px; margin-bottom: 20px; }
    .reason { font-size: 15px; line-height: 1.6; color: #334155; max-width: 500px; margin: 0 auto 40px auto; }
    .signature-row { display: flex; justify-content: space-around; margin-top: 50px; font-size: 13px; color: #475569; }
    .sig-line { border-top: 1px solid #94a3b8; width: 180px; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="cert-border">
    <div class="gold-seal">Certificate of Excellence</div>
    <h1>Certificate of Achievement</h1>
    <p class="subtitle">This prestigious honor is proudly conferred upon</p>
    <div class="recipient">Alex Mercer</div>
    <p class="reason">For exceptional dedication, architectural leadership, and groundbreaking mastery in building privacy-first client-side web technologies.</p>
    <div class="signature-row">
      <div>
        <div class="sig-line">Director of Technology</div>
      </div>
      <div>
        <div class="sig-line">October 24, 2026</div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  report: {
    name: "Executive Report",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quarterly Performance Review</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; padding: 40px; margin: 0; line-height: 1.6; }
    h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
    h2 { color: #2563eb; margin-top: 24px; }
    p { font-size: 14px; color: #334155; }
    .metrics { display: flex; gap: 16px; margin: 20px 0; }
    .card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .card .val { font-size: 24px; font-weight: bold; color: #0f172a; }
    .card .lbl { font-size: 12px; color: #64748b; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Quarterly Executive Report</h1>
  <p><strong>Reporting Period:</strong> Q3 2026 | <strong>Status:</strong> Approved</p>
  
  <h2>Key Performance Indicators</h2>
  <div class="metrics">
    <div class="card"><div class="val">85</div><div class="lbl">Live Platform Tools</div></div>
    <div class="card"><div class="val">100%</div><div class="lbl">Client-Side Privacy</div></div>
    <div class="card"><div class="val">0 ms</div><div class="lbl">Server Upload Latency</div></div>
  </div>

  <h2>Summary of Operations</h2>
  <p>During this operational cycle, all client tools were migrated to native in-browser execution with zero reliance on cloud computation for private user files. Security audits confirmed zero network transmissions across all 85 tool modules.</p>
</body>
</html>`,
  },
};

/**
 * Validate HTML string basic structure
 */
export function validateHtmlString(html: string): { valid: boolean; error?: string } {
  if (!html || !html.trim()) {
    return { valid: false, error: "HTML source is empty." };
  }
  return { valid: true };
}

/**
 * Inject standardized print styles and page constraints into HTML head
 */
export function injectPrintStyles(html: string, options: PrintOptions): string {
  const marginCss =
    options.margin === "none"
      ? "0"
      : options.margin === "narrow"
      ? "10mm"
      : options.margin === "wide"
      ? "30mm"
      : "20mm";

  const printStyleTag = `
  <style id="cleartrix-print-styles">
    @page {
      size: ${options.pageSize};
      margin: ${marginCss};
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
  `;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${printStyleTag}\n</head>`);
  }
  return `${printStyleTag}\n${html}`;
}

/**
 * Extract title from HTML or return a clean fallback
 */
export function extractDocumentTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match && match[1]?.trim()) {
    return match[1].trim();
  }
  return "Document";
}

/**
 * Strip dangerous script execution tags while preserving styling and content
 */
export function sanitizeHtmlForPrint(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/onload\s*=\s*["'][^"']*["']/gi, "")
    .replace(/onerror\s*=\s*["'][^"']*["']/gi, "");
}

