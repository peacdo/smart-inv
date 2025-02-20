"use client"

import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { QRCodeSection } from "@/components/items/qr-code-section"

interface ItemDetails {
  id: string
  name: string
  description: string | null
  dimensions: string | null
  weight: number | null
  storageConditions: string | null
  handlingInstructions: string | null
  stockLevel: number
  location: string | null
  expiryDate: string | null
  status: string
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
}

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/items/${id}`)
        if (!response.ok) {
          throw new Error("Item not found")
        }
        const data = await response.json()
        setItem(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [params])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800"
      case "LOW_STOCK":
        return "bg-yellow-100 text-yellow-800"
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800"
      case "EXPIRED":
        return "bg-gray-100 text-gray-800"
      case "DAMAGED":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {item.name}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Location: {item.location || "Not specified"}
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href={`/dashboard/inventory/${item.id}/edit`}
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Edit Item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Item Details</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Detailed information about the item including specifications and handling instructions.
          </p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Stock Level</dt>
              <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{item.stockLevel}</dd>
            </div>
            {item.dimensions && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">Dimensions</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{item.dimensions}</dd>
              </div>
            )}
            {item.weight && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">Weight</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{item.weight} kg</dd>
              </div>
            )}
            {item.expiryDate && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">Expiry Date</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {new Date(item.expiryDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            {item.description && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">Description</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {item.description}
                </dd>
              </div>
            )}
            {item.storageConditions && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">Storage Conditions</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {item.storageConditions}
                </dd>
              </div>
            )}
            {item.handlingInstructions && (
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">Handling Instructions</dt>
                <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                  {item.handlingInstructions}
                </dd>
              </div>
            )}
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Added By</dt>
              <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                {item.createdBy.name || item.createdBy.email}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Added On</dt>
              <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                {new Date(item.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <QRCodeSection itemId={item.id} />
    </div>
  )
} 