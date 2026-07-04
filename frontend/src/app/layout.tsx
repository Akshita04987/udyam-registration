import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Udyam Registration | Ministry of MSME, Government of India",
  description:
    "Register your micro, small or medium enterprise online through the official Udyam Registration Portal of the Ministry of MSME, Government of India.",
  keywords:
    "Udyam Registration, MSME, Government of India, enterprise registration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
