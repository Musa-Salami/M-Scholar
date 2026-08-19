import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M-Scholars' Academy — Academic Excellence & Moral Values",
  description:
    "Islamic and Western education in Ogaminana, Adavi LGA, Kogi State. Kindergarten to Primary. Call or WhatsApp 08035672451.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "M-Scholars' Academy" },
};

export const viewport: Viewport = {
  themeColor: "#1A1464",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
