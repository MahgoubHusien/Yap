import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yap - Next Generation Social",
  description: "Join free-flowing conversations in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 dark:bg-black dark:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
