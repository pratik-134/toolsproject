import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  // Safelist: category-theme Tailwind classes used dynamically in lib/category-theme.ts
  safelist: [
    // Ruby Red — document-pdf
    "bg-red-50", "border-red-200", "text-red-600", "bg-red-600",
    "hover:bg-red-700", "focus-visible:ring-red-500",
    // Amber/Orange — image, video
    "bg-orange-50", "border-orange-200", "text-orange-600", "bg-orange-600",
    "hover:bg-orange-700", "focus-visible:ring-orange-500",
    // Navy — security, calculators
    "bg-blue-50", "border-blue-200", "text-blue-700", "bg-blue-700",
    "hover:bg-blue-800", "focus-visible:ring-blue-600",
    // Violet — url-cloud, codes, builders
    "bg-violet-50", "border-violet-200", "text-violet-700", "bg-violet-700",
    "hover:bg-violet-800", "focus-visible:ring-violet-500",
    // Emerald — developer, utilities, audio
    "bg-emerald-50", "border-emerald-200", "text-emerald-700", "bg-emerald-700",
    "hover:bg-emerald-800", "focus-visible:ring-emerald-500",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          primaryDark: "#1E3A8A",
          mint: "#93C5FD",
          surface: "#EFF6FF",
          border: "#BFDBFE",
          // Backwards compatibility mappings
          green: "#2563EB",
          greenDark: "#1E3A8A",
          greenHover: "#1D4ED8",
          greenLight: "#EFF6FF",
          greenBorder: "#BFDBFE",
          indigo: "#2563EB",
          indigoDark: "#1D4ED8",
          indigoLight: "#EFF6FF",
          indigoBorder: "#BFDBFE",
          emerald: "#2563EB",
          blue: "#2563EB",
          amber: "#D97706",
          red: "#DC2626",
          redDark: "#B91C1C",
          redLight: "#FEF2F2",
          redBorder: "#FECACA",
          navy: "#0F172A",
          midnight: "#18181B",
        },
        "surface-white": "var(--surface-white, #FFFFFF)",
        "canvas-slate": "var(--canvas-slate, #F8FAFC)",
        "border-slate": "var(--border-slate, #E2E8F0)",
        "dark-slate": "var(--dark-slate, #0F172A)",
        surface: {
          light: "#F5F5F5",      // Neutral light card fills & alternating section backgrounds
          white: "#FFFFFF",
          black: "#0F172A",
        },
        text: {
          primary: "#1A1A1A",    // High-contrast charcoal text for light surfaces
          muted: "#555555",      // Descriptive text, subtitles, secondary labels
        },
        status: {
          active: "#28A745",     // Live / In Stock badge
          alert: "#DC3545",      // Sold out / Urgent badge
          gold: "#FFB800",       // Star ratings
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        headings: ['var(--font-inter)', "Inter", "sans-serif"],
        body: ['var(--font-inter)', "Inter", "sans-serif"],
        sans: ['var(--font-inter)', "Inter", "sans-serif"],
      },
      fontSize: {
        // ── Design System Spec: WebTools Core Modular Scale ───────────────
        // Display / Hero H1 — 40px / 2.5rem
        "display": ["40px", { lineHeight: "1.2", letterSpacing: "-0.025em", fontWeight: "700" }],
        // Section Header H2 — 28px / 1.75rem
        "section-h2": ["28px", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "600" }],
        // Card Title H3 — 18px / 1.125rem
        "card-title": ["18px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
        // Body Regular — 15px / 0.9375rem
        "body-md": ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        // Body Small / Tooltip — 13px / 0.8125rem
        "body-sm": ["13px", { lineHeight: "1.4", fontWeight: "500" }],
        // Technical Subtitle / Tag / Eyebrow — 11px / 0.6875rem
        "eyebrow": ["11px", { lineHeight: "1.3", letterSpacing: "0.05em", fontWeight: "600" }],

        // ── Legacy scale preserved for backward compatibility ─────────────
        hero: ["54px", { lineHeight: "1.15", letterSpacing: "-0.5px", fontWeight: "700" }],
        "hero-tablet": ["40px", { lineHeight: "1.20", letterSpacing: "-0.3px", fontWeight: "700" }],
        "hero-mobile": ["32px", { lineHeight: "1.20", letterSpacing: "0px", fontWeight: "700" }],
        section: ["38px", { lineHeight: "1.25", letterSpacing: "0px", fontWeight: "700" }],
        "section-tablet": ["30px", { lineHeight: "1.25", letterSpacing: "0px", fontWeight: "700" }],
        "section-mobile": ["26px", { lineHeight: "1.25", letterSpacing: "0px", fontWeight: "700" }],
        h3: ["20px", { lineHeight: "1.25", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "1.30", fontWeight: "600" }],
        h5: ["16px", { lineHeight: "1.40", fontWeight: "600" }],
        subtitle: ["18px", { lineHeight: "1.50", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.50", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.40", fontWeight: "400" }],
        eyebrow_legacy: ["12px", { lineHeight: "1.20", letterSpacing: "1.2px", fontWeight: "600" }],
        price: ["26px", { lineHeight: "1.10", fontWeight: "800" }],
        "price-del": ["16px", { lineHeight: "1.10", fontWeight: "500" }],
      },
      spacing: {
        "section-py": "100px",
        "section-py-tab": "70px",
        "section-py-mob": "50px",
        "section-mb": "60px",
        "section-mb-mob": "30px",
      },
      maxWidth: {
        container: "1420px",
      },
      borderRadius: {
        badge: "6px",
        btn: "8px",
        media: "8px",
        card: "10px",
        pill: "8px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "card-rest": "0px 1px 3px 0px rgba(0, 0, 0, 0.05), 0px 1px 2px 0px rgba(0, 0, 0, 0.03)",
        "card-hover": "0px 10px 25px -5px rgba(0, 0, 0, 0.08), 0px 8px 10px -6px rgba(0, 0, 0, 0.04)",
        "btn-glow": "0px 0px 20px 0px rgba(22, 163, 74, 0.35)",
        "btn-subtle": "0px 8px 16px -8px rgba(22, 163, 74, 0.25)",
        dock: "0px 10px 30px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(6px)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      screens: {
        xs: "400px",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-delayed": "float-delayed 7s ease-in-out infinite 1.5s",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
