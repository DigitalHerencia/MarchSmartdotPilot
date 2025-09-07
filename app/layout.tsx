import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import Link from "next/link"
import SwRegister from "@/components/SwRegister"
import RouteSyncInit from "@/components/RouteSyncInit"
import GpsBadge from "@/components/GpsBadge"
import ThemeToggle from "@/components/ThemeToggle"
import UserActions from "@/components/UserActions"

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary group-hover:bg-primary/15 transition-colors">
        <span className="font-bold">MB</span>
      </div>
      <div className="leading-tight">
        <div className="font-semibold">Marching Band Studio</div>
        <div className="text-xs text-muted-foreground">Real-time GPS & practice</div>
      </div>
    </Link>
  )
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Marching Band Practice Studio",
  description: "Real-time GPS tracking and musical practice for high school marching bands",
  keywords: "marching band, GPS tracking, music practice, metronome, field formations",
  authors: [{ name: "Marching Band Practice Studio" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <SwRegister />
          <RouteSyncInit />
          {/* App Shell Header */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container-app py-3 flex items-center gap-4">
              <Brand />
              <nav className="ml-auto">
                <ul className="flex items-center gap-1 tabs-pills">
                  <li><a href="#field" className="px-3 py-2 rounded-md text-sm">Field</a></li>
                  <li><a href="#music" className="px-3 py-2 rounded-md text-sm">Music</a></li>
                  <li><a href="#routes" className="px-3 py-2 rounded-md text-sm">Routes</a></li>
                  <li><a href="#students" className="px-3 py-2 rounded-md text-sm">Students</a></li>
                </ul>
              </nav>
              <div className="hidden sm:flex items-center gap-2">
                <GpsBadge />
                <ThemeToggle />
                <UserActions />
              </div>
            </div>
          </header>

          {children}
        </body>
      </html>
  </Providers>
  )
}
