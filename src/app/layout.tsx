import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Italian Tax Calculator",
  description: "Estimate Italian taxes (IRPEF, addizionali, INPS).",
  icons: {
    icon: [
      { url: "/favicon.png?v=6", type: "image/png" },
      { url: "/favicon.ico?v=6" }
    ],
    shortcut: ["/favicon.ico?v=6"],
    apple: [{ url: "/apple-touch-icon.png?v=6" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
