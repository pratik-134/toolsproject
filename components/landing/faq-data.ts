export interface FaqItem {
  num: string;
  q: string;
  a: string;
}

export const RESUME_FAQS: FaqItem[] = [
  {
    num: "01",
    q: "Is Qwertygen Resume Builder truly 100% free with no hidden paywalls or watermarks?",
    a: "Yes, unconditionally. Unlike services that lure you in only to demand a credit card at the final download step, Qwertygen is completely free. All 20 templates, all styling tools, and every vector PDF export are 100% unrestricted.",
  },
  {
    num: "02",
    q: "Are these resume templates optimized and tested for Applicant Tracking Systems (ATS)?",
    a: "Yes. Every template is strictly formatted with semantic heading tags, standard date formats, standard section keys, and linear text hierarchies tested against enterprise ATS parsers including Workday, Greenhouse, Taleo, iCIMS, and Lever.",
  },
  {
    num: "03",
    q: "Do I need to sign up, create an account, or enter a credit card?",
    a: "No sign-up and no credit card required. You can start creating your resume right now without entering an email address or password. Jump directly into the builder and start editing immediately.",
  },
  {
    num: "04",
    q: "How does Qwertygen protect my personal privacy and resume details?",
    a: "Qwertygen runs on a strict client-side sandbox architecture. Your resume data, contact info, and work history remain in your browser's private local storage—never transmitted to external servers, logged in databases, or sold to third parties.",
  },
  {
    num: "05",
    q: "Can I download my resume as a high-resolution vector PDF?",
    a: "Yes. Qwertygen utilizes an in-browser vector PDF compilation engine that produces crystal-clear, print-ready documents with selectable text and embedded fonts on standard A4 dimensions. You can also print directly from your browser.",
  },
  {
    num: "06",
    q: "Will my resume data be preserved if I close my browser tab?",
    a: "Yes. As you type, changes are automatically saved to your browser's local memory. When you return on the same computer and browser, your draft will be waiting for you.",
  },
  {
    num: "07",
    q: "How does Qwertygen compare to other resume builders?",
    a: "Traditional graphic builders often produce complex layers that choke ATS parsers, while subscription builders demand credit cards at download. Qwertygen provides clean, parser-verified semantic code structure, pin-sharp vector PDF exports, and complete feature access with zero paywalls.",
  },
  {
    num: "08",
    q: "Can I customize colors, fonts, and add custom sections?",
    a: "Yes! Choose from curated color accents, professional typography pairings (Inter, Poppins, Lora, Playfair, JetBrains Mono), and add custom sections such as Certifications, Languages, Awards, Projects, or Publications.",
  },
];

export const TOOLS_FAQS: FaqItem[] = [
  {
    num: "01",
    q: "How can Qwertygen tools run with zero server uploads?",
    a: "Every tool executes directly inside your browser sandbox via WebAssembly, Web Workers, Canvas, and client-side JavaScript. When you process files or calculate data, computation happens in device memory—never transmitting a single byte across the internet.",
  },
  {
    num: "02",
    q: "Are the tools really free forever with no limits?",
    a: "Yes. There are no trial periods, monthly subscriptions, credit card prompts, or daily usage caps. Every tool across all 5 categories is permanently accessible and 100% free to use without restrictions.",
  },
  {
    num: "03",
    q: "Is there a file size limit for PDF or image processing?",
    a: "Because processing happens directly on your device rather than our servers, file size limits are governed by your device's available memory (RAM). Most modern laptops and phones easily process PDFs and images up to 50MB–100MB+ without any lag.",
  },
  {
    num: "04",
    q: "Do I need to create an account or provide an email?",
    a: "Never. None of our tools require registration, login, or personal information. You can use any tool instantly without giving up your email address or creating yet another password.",
  },
  {
    num: "05",
    q: "Can I use these tools offline?",
    a: "Once the tool page is loaded in your browser cache, the client-side processing logic runs entirely on your local machine. You can disconnect from the internet or work in airplane mode, and your tools will continue functioning seamlessly.",
  },
  {
    num: "06",
    q: "How do you make money if everything is free?",
    a: "Qwertygen is built with an ultra-lean architecture: because all computation happens on the client side, our server hosting costs are negligible compared to traditional cloud platforms. We sustain operations through non-intrusive affiliate partnerships, developer sponsorships, and future optional enterprise team features—never by gating basic consumer tools or selling user data.",
  },
  {
    num: "07",
    q: "Are these tools safe for confidential work documents and sensitive data?",
    a: "Yes, they are far safer than traditional cloud converters. Because files are never sent over the internet to remote servers, there is zero risk of data intercepts, server breaches, or cloud logging. Your private financial reports, legal contracts, and confidential images remain strictly on your machine.",
  },
];
