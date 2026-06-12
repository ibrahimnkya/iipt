import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIIS-T – Secure Your Imported Goods",
  description: "NIIS-T is the National Import Insurance System – Tanzania where importers can easily secure their marine cargo cover notes and manage compliant trade policies online.",
  keywords: "NIIS-T, Tanzania Import Insurance, Insurance Portal, Import Insurance, Cargo Insurance, Freight Insurance, Tanzania insurance, online insurance for imports, TIRA cover note",
};

import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AutoLogout } from "@/components/auth/auto-logout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
          <AuthProvider>
            <AutoLogout />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
