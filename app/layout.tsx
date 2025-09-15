import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geist-sans",
});

const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Buat Invoice Gratis - Cepat & Mudah",
  description:
    "Buat invoice profesional secara gratis dengan alat pembuat invoice kami yang mudah digunakan. Hemat waktu dan kelola tagihan Anda dengan efisien.",
  keywords: [
    "buat invoice",
    "pembuat invoice",
    "invoice gratis",
  ],
  authors: [{ name: "Denshanif", url: "https://denshanif.my.id" }],
  openGraph: {
    title: "Buat Invoice Gratis - Cepat & Mudah",
    description:
      "Buat invoice profesional secara gratis dengan alat pembuat invoice kami yang mudah digunakan. Hemat waktu dan kelola tagihan Anda dengan efisien.",
    siteName: "Invoice Generator",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
