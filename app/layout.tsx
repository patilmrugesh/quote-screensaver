import type { Metadata } from "next";
import {
  Playfair_Display,
  Merriweather,
  Lora,
  Cormorant_Garamond,
  Poppins,
  Montserrat,
  Inter,
  Raleway,
} from "next/font/google";
import "./globals.css";

// Each font is exposed as a CSS variable whose name must match the
// `value` strings in FONT_OPTIONS (lib/constants.ts), e.g.
// { label: "Playfair Display", value: "var(--font-playfair)" }.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

const fontVariables = [
  playfairDisplay.variable,
  merriweather.variable,
  lora.variable,
  cormorantGaramond.variable,
  poppins.variable,
  montserrat.variable,
  inter.variable,
  raleway.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Motivational Quote Screensaver",
  description:
    "A fullscreen, customizable motivational quote screensaver — thousands of quotes, auto-shuffling, with your own colors, fonts, and timing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={fontVariables}>{children}</body>
    </html>
  );
}