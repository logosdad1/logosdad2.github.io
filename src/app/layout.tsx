import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omnisight AI — How Does AI See Your Business?",
  description:
    "Get a simple AI-powered audit of your website, digital presence, and AI visibility — and discover what's making your business harder to find, understand, and trust.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.className}`}>
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100 antialiased selection:bg-teal-500/30 selection:text-teal-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
