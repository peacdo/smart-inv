"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (session) {
    redirect("/dashboard")
  }

  redirect("/login")
}
