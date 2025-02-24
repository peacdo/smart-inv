"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Order {
  id: string
  status: string
  user: {
    name: string
    email: string
  }
  items: { id: string; name: string }[]
  createdAt: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders")
        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return
    }

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete order")
      }

      setOrders((orders) => orders.filter((order) => order.id !== id))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete order")
    }
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all orders including their status, items, and processing details.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-3">
          <input
            type="text"
            placeholder="Search by Order ID or User Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-2"
          />
          <Link
            href="/dashboard/orders/analytics"
            className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            View Analytics
          </Link>
          <Link
            href="/dashboard/orders/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Order
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
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Order ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      User
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created At
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <Link href={`/dashboard/orders/${order.id}`} className="hover:text-indigo-600">
                            {order.id}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.status}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.user.name || order.user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
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
  )
} 