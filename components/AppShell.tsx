import type { ReactNode } from "react";
import BottomNav from "./bottom-nav";
import SwRegister from "./SwRegister";
import RouteSyncInit from "./RouteSyncInit";
import GpsBadge from "./GpsBadge";
import ThemeToggle from "./ThemeToggle";
import UserActions from "./UserActions";
import Link from "next/link";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-border">
        <Link href="/" className="font-semibold">
          Marching Band Studio
        </Link>
        <div className="flex items-center gap-2">
          <GpsBadge />
          <ThemeToggle />
          <UserActions />
        </div>
      </header>
      <main className="flex-1 container-app pb-20">{children}</main>
      <BottomNav />
      <SwRegister />
      <RouteSyncInit />
    </div>
  );
}
