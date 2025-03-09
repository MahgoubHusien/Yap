import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar"; // Floating Dock for Desktop
import MobileNavBar from "@/components/MobileNavBar"; // Sidebar for Mobile
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yap - Social Conversations",
  description: "Join real-time discussions on trending topics!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Mobile Sidebar Nav */}
        <MobileNavBar />

        {/* Floating Dock Navbar for Web */}
        <Navbar />

        <main className="mt-16 md:mt-20">{children}</main>
      </body>
    </html>
  );
}
