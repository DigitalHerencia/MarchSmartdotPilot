"use client"

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default function UserActions() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <Link href="/sign-in" className="text-sm text-primary hover:underline">Sign in</Link>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
        <Link href="/settings" className="text-sm text-primary hover:underline">Settings</Link>
      </SignedIn>
    </div>
  )
}
