"use client"

import { SignIn } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

export default function Page() {
  const path = usePathname()

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignIn routing="path" signUpUrl="/sign-up" path={path} />
    </div>
  )
}
