"use client"

import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ItemForm } from "@/components/forms/item-form"
import { useParams } from "next/navigation"

export default function EditItemPage() {
  const { data: session, status } = useSession()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch item")
        }
        const data = await response.json()
        setItem(data)
        setLoading(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred")
        setLoading(false)
      }
    }

    if (id) {
      fetchItem()
    }
  }, [id])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => router.push("/dashboard/inventory")}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Go back to inventory
          </button>
        </div>
      </div>
    )
  }

  if (!item) {
    return null
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Item
          </h2>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <ItemForm
            initialData={item}
            onSuccess={() => {
              router.push("/dashboard/inventory")
            }}
          />
        </div>
      </div>
    </div>
  )
}