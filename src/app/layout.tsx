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
      { url: "/favicon.png?v=3", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico?v=3" },
    ],
    shortcut: ["/favicon.ico?v=3"],
    apple: [{ url: "/apple-touch-icon.png?v=3" }],
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
