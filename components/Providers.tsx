"use client"

import { ReactNode } from "react"
import { UserProvider } from "@/lib/user-context"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
