import type { Metadata } from "next";
import { Nunito_Sans, Inconsolata } from "next/font/google";
import { siteConfig } from "@/site.config";
import "katex/dist/katex.min.css";
import "./globals.css";

const siteName = `${siteConfig.name.first} ${siteConfig.name.last}`;

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteName,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${inconsolata.variable}`}
    >
      <body className="bg-bg text-body type-body">{children}</body>
    </html>
  );
}
