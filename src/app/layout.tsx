import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/components/session-provider-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM & Field Tracking System",
  description: "Complete CRM and Employee Field Tracking Management System",
  keywords: ["CRM", "Field Tracking", "Employee Management", "Next.js", "TypeScript"],
  authors: [{ name: "CRM Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CRM & Field Tracking System",
    description: "Complete CRM and Employee Field Tracking Management System",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRM & Field Tracking System",
    description: "Complete CRM and Employee Field Tracking Management System",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProviderWrapper>
          {children}
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
