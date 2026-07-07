import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/sidebar";
import { Breadcrumb } from "./components/breadcrumb";
import { ConnectBank } from "./connect-bank";
import { RefreshButton } from "./refresh-button";
import { ChatWidget } from "./components/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mulch",
  description: "Personal finance tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <div className="flex">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="glass-nav sticky top-0 z-40 flex items-center justify-between border-b border-ink-faint px-8 py-4">
              <Breadcrumb />
              <div className="flex items-center gap-3">
                <RefreshButton />
                <ConnectBank />
              </div>
            </header>
            <main className="mx-auto w-full max-w-5xl px-8 py-10">
              {children}
            </main>
          </div>
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
