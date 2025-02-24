"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

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
  status: string
  createdAt: string
}

export default function PublicItemPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/public/items/${id}`)
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

  const handleRequestItem = async () => {
    if (!item || !session) return;

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CHECKOUT",
          itemId: item.id,
          userId: session.user.id,
          quantity: 1,
          notes: "Requesting this item",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request item");
      }

      alert("Item requested successfully!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to request item");
    }
  };

  const handleReportIssue = () => {
    // Redirect to report issue page or open a modal
    alert("Report Issue functionality not implemented yet.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Item Not Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {error || "The requested item could not be found."}
          </p>
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{item.name}</h1>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status.replace("_", " ")}
              </span>
              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800">
                Stock: {item.stockLevel}
              </span>
              {item.location && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-800">
                  Location: {item.location}
                </span>
              )}
            </div>

            {item.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              </div>
            )}

            <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {item.dimensions && (
                <div>
                  <dt className="text-sm font-medium text-gray-900">Dimensions</dt>
                  <dd className="mt-1 text-sm text-gray-500">{item.dimensions}</dd>
                </div>
              )}
              {item.weight && (
                <div>
                  <dt className="text-sm font-medium text-gray-900">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-500">{item.weight} kg</dd>
                </div>
              )}
              {item.storageConditions && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-900">Storage Conditions</dt>
                  <dd className="mt-1 text-sm text-gray-500">{item.storageConditions}</dd>
                </div>
              )}
              {item.handlingInstructions && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-900">Handling Instructions</dt>
                  <dd className="mt-1 text-sm text-gray-500">{item.handlingInstructions}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <button
                type="button"
                onClick={handleRequestItem}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Request Item
              </button>
              <button
                type="button"
                onClick={handleReportIssue}
                className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 