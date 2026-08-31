import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AKSARA Management System",
  description: "Integrated Business & Employee Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans bg-primary-light text-text min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
