"use client"

import { ClerkProvider } from "@clerk/nextjs"
import type { PropsWithChildren } from "react"

export default function Providers({ children }: PropsWithChildren) {
  return <ClerkProvider>{children}</ClerkProvider>
}
