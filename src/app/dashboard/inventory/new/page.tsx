"use client"

import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { ItemForm } from "@/components/forms/item-form"

export default function NewItemPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Item
          </h2>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <ItemForm
            onSuccess={() => {
              router.push("/dashboard/inventory")
            }}
          />
        </div>
      </div>
    </div>
  )
} 