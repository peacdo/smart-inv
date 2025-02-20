"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Signing out...</h1>
        <p className="text-gray-500 mt-2">Please wait while we sign you out.</p>
      </div>
    </div>
  )
} 