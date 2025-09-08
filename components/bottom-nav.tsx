"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Music, Route, Activity } from "lucide-react";

const links = [
  { href: "/field", label: "Field", icon: Map },
  { href: "/practice", label: "Practice", icon: Activity },
  { href: "/routes", label: "Routes", icon: Route },
  { href: "/music", label: "Music", icon: Music },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background">
      <ul className="grid grid-cols-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center py-2 text-xs ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
