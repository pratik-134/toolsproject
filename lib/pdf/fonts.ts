import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

export function registerPdfFonts(): void {
  if (fontsRegistered) return;

  try {
    // Disable hyphenation for clean line breaks in resumes
    Font.registerHyphenationCallback((word) => [word]);

    // 1. Inter (Modern Sans & ATS)
    Font.register({
      family: "Inter",
      fonts: [
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
          fontWeight: 700,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-italic.ttf",
          fontWeight: 400,
          fontStyle: "italic",
        },
      ],
    });

    // 2. Lora (Classic Serif & Academic)
    Font.register({
      family: "Lora",
      fonts: [
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf",
          fontWeight: 700,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-italic.ttf",
          fontWeight: 400,
          fontStyle: "italic",
        },
      ],
    });

    // 3. Playfair Display (Executive & Elegant)
    Font.register({
      family: "Playfair",
      fonts: [
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf",
          fontWeight: 700,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-italic.ttf",
          fontWeight: 400,
          fontStyle: "italic",
        },
      ],
    });

    // 4. JetBrains Mono (Tech & Developer)
    Font.register({
      family: "JetBrainsMono",
      fonts: [
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.ttf",
          fontWeight: 700,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-italic.ttf",
          fontWeight: 400,
          fontStyle: "italic",
        },
      ],
    });

    // 5. Poppins (Creative & Bold)
    Font.register({
      family: "Poppins",
      fonts: [
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf",
          fontWeight: 700,
        },
        {
          src: "https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-italic.ttf",
          fontWeight: 400,
          fontStyle: "italic",
        },
      ],
    });

    fontsRegistered = true;
  } catch (error) {
    console.warn("Font registration failed, using built-in PostScript fonts:", error);
  }
}
