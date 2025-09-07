"use client"

import { SignUp } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

export default function Page() {
  const path = usePathname() ?? undefined

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignUp routing="path" signInUrl="/sign-in" path={path} />
    </div>
  )
}
