import "./globals.css";
import "katex/dist/katex.min.css";
import { Syne, DM_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "EurekaAI — Stop getting answers. Start building understanding.",
  description:
    "EurekaAI uses the Socratic method and Feynman technique to help JEE Advanced aspirants actually understand physics, chemistry, and math — not just memorise answers.",
  keywords: "JEE Advanced, JEE Mains, NEET, AI tutor, Feynman technique, Socratic method, active recall, spaced repetition",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${playfair.variable} ${jetbrains.variable}`}
    >
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
