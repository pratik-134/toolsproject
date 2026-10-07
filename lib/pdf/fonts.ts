import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

export function registerPdfFonts(): void {
  if (fontsRegistered) return;

  try {
    // Disable hyphenation for clean line breaks in resumes
    Font.registerHyphenationCallback((word) => [word]);

    // 1. Manrope (Sole Brand Typography)
    Font.register({
      family: "Manrope",
      fonts: [
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-700-normal.ttf",
          fontWeight: 700,
        },
      ],
    });

    // Alias legacy family names directly to Manrope to maintain compatibility with existing stored resumes
    const legacyAliases = ["Inter", "Lora", "Playfair", "JetBrainsMono", "Poppins"];
    legacyAliases.forEach((alias) => {
      Font.register({
        family: alias,
        fonts: [
          {
            src: "https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-400-normal.ttf",
            fontWeight: 400,
          },
          {
            src: "https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-700-normal.ttf",
            fontWeight: 700,
          },
        ],
      });
    });

    fontsRegistered = true;
  } catch (error) {
    console.warn("Font registration failed, using built-in PostScript fonts:", error);
  }
}
