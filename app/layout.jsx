import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata = {
  title: "EurekaAI — Study smarter for JEE Advanced",
  description: "The AI tutor that refuses to hand you the answer — until you've earned it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
