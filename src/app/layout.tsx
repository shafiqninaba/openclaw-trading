import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Awkclaw 🐢 — Paper Trading Dashboard",
  description:
    "AI paper trading bot dashboard. Follow along as Awkclaw learns to trade.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-foreground antialiased">
        <Header />
        <main className="mx-auto max-w-lg px-4 pb-20 pt-4">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
