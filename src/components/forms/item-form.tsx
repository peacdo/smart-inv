"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ItemStatus = {
  AVAILABLE: "AVAILABLE",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  EXPIRED: "EXPIRED",
  DAMAGED: "DAMAGED",
} as const

type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus]

interface ItemFormProps {
  initialData?: {
    id?: string
    name: string
    description?: string | null
    dimensions?: string | null
    weight?: number | null
    storageConditions?: string | null
    handlingInstructions?: string | null
    stockLevel: number
    location?: string | null
    expiryDate?: Date | null
    status: ItemStatus
  }
  onSuccess?: () => void
}

interface FormData {
  name: string
  description: string
  dimensions: string
  weight: string
  storageConditions: string
  handlingInstructions: string
  stockLevel: string
  location: string
  expiryDate: string
  status: ItemStatus
}

export function ItemForm({ initialData, onSuccess }: ItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    dimensions: initialData?.dimensions || "",
    weight: initialData?.weight?.toString() || "",
    storageConditions: initialData?.storageConditions || "",
    handlingInstructions: initialData?.handlingInstructions || "",
    stockLevel: initialData?.stockLevel?.toString() || "",
    location: initialData?.location || "",
    expiryDate: initialData?.expiryDate
      ? new Date(initialData.expiryDate).toISOString().split("T")[0]
      : "",
    status: initialData?.status || "AVAILABLE" as ItemStatus,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert string values to numbers where needed
      const payload = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        stockLevel: parseInt(formData.stockLevel, 10) || 0,
      }

      const response = await fetch(
        initialData?.id ? `/api/items/${initialData.id}` : "/api/items",
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong")
      }

      router.refresh()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="stockLevel" className="block text-sm font-medium text-gray-700">
            Stock Level *
          </label>
          <input
            type="number"
            id="stockLevel"
            name="stockLevel"
            required
            min="0"
            value={formData.stockLevel}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          >
            {(Object.keys(ItemStatus) as Array<keyof typeof ItemStatus>).map((status) => (
              <option key={status} value={ItemStatus[status]}>
                {ItemStatus[status].replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            step="0.01"
            value={formData.weight}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
            Dimensions
          </label>
          <input
            type="text"
            id="dimensions"
            name="dimensions"
            placeholder="L x W x H"
            value={formData.dimensions}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="storageConditions" className="block text-sm font-medium text-gray-700">
          Storage Conditions
        </label>
        <textarea
          id="storageConditions"
          name="storageConditions"
          rows={2}
          value={formData.storageConditions}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="handlingInstructions" className="block text-sm font-medium text-gray-700">
          Handling Instructions
        </label>
        <textarea
          id="handlingInstructions"
          name="handlingInstructions"
          rows={2}
          value={formData.handlingInstructions}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update Item" : "Create Item"}
        </button>
      </div>
    </form>
  )
} 