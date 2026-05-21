import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marcus Alenius",
  description: "Personal site of Marcus Alenius.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className="bg-bg text-body type-body">{children}</body>
    </html>
  );
}
