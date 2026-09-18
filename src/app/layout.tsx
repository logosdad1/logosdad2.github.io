import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ordigit — How Does AI See Your Business?",
  description:
    "Business Visibility Intelligence. Discover how AI, search, and maps understand your business.",
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
