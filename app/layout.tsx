import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marching Band Practice Studio",
  description: "Real-time GPS tracking and musical practice for high school marching bands",
  keywords: "marching band, GPS tracking, music practice, metronome, field formations",
  authors: [{ name: "Marching Band Practice Studio" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="theme-color" content="#0ea5e9" />
        </head>
        <body
          className={[
            inter.className,
            "min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground",
          ].join(" ")}
        >
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </Providers>
  );
}
