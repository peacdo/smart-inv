"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import LoadingSpinner from '@/components/LoadingSpinner'

const ItemStatus = {
  AVAILABLE: "AVAILABLE",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  EXPIRED: "EXPIRED",
  DAMAGED: "DAMAGED",
} as const

type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus]

interface Item {
  id: string
  name: string
  description: string | null
  stockLevel: number
  location: string | null
  status: ItemStatus
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/items")
        if (!response.ok) {
          throw new Error("Failed to fetch items")
        }
        const data = await response.json()
        setItems(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  if (status === "loading" || loading) {
    return <LoadingSpinner fullScreen text="Loading inventory..." />
  }

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>;
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    setDeleting(id);
    setError(null);

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      setItems((items) => items.filter((item) => item.id !== id))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete item")
    } finally {
      setDeleting(null);
    }
  }

  const getStatusColor = (status: ItemStatus) => {
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

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      {deleting && <LoadingSpinner overlay text="Deleting item..." />}
      <div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all items in your inventory including their name, location, stock level, and
              status.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-3">
            <input
              type="text"
              placeholder="Search by Item Name or Status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md p-2"
            />
            <Link
              href="/dashboard/inventory/new"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add item
            </Link>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Stock Level
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Added By
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                        >
                          {loading ? "Loading..." : "No items found"}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className={deleting === item.id ? 'opacity-50' : ''}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <Link href={`/dashboard/inventory/${item.id}`} className="hover:text-indigo-600">
                              {item.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.location || "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.stockLevel}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.createdBy.name || item.createdBy.email}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/dashboard/inventory/${item.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </Link>
                            {session.user.role === "ADMIN" && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 