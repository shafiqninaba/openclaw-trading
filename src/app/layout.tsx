import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-provider";
import { ContentArea } from "@/components/content-area";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SidebarProvider>
          <Sidebar />
          <ContentArea>
            <Header />
            <main className="mx-auto max-w-lg px-4 pb-20 pt-4 lg:max-w-5xl lg:pb-8 lg:pt-6 lg:px-8">
              {children}
            </main>
          </ContentArea>
          <BottomNav />
        </SidebarProvider>
      </body>
    </html>
  );
}
