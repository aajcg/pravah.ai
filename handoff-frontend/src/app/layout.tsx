import type { Metadata } from "next";
import { Syne, Epilogue, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Pravah.ai — Let Work Flow",
  description:
    "AI Handoff Intelligence. Knowledge travels. Context never dies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${epilogue.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {/* Grain overlay */}
        <div className="grain" aria-hidden />

        {/* Ticker ribbon */}
        <div className="ticker-wrap" aria-hidden>
          <div className="ticker-track">
            {[...Array(4)].map((_, i) => (
              <span key={i} style={{ display: "contents" }}>
                <span className="ticker-item">
                  <span className="ticker-dot" />
                  MSA Resonate 2026
                </span>
                <span className="ticker-sep">/</span>
                <span className="ticker-item">Team Thinkode</span>
                <span className="ticker-sep">/</span>
                <span className="ticker-item ticker-brand">
                  Pravah<b>.ai</b>
                </span>
                <span className="ticker-sep">/</span>
                <span className="ticker-item">AI Handoff Intelligence</span>
                <span className="ticker-sep">/</span>
              </span>
            ))}
          </div>
        </div>

        {children}

        <Toaster
          richColors
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              border: "1px solid rgba(212,164,76,0.25)",
              color: "var(--paper)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}