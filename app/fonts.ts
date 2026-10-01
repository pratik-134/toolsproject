import { Manrope } from "next/font/google";

export const fontManrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const fontClassNames = `${fontManrope.variable}`;
