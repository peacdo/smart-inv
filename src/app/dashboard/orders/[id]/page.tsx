"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from '@/components/LoadingSpinner';

interface Order {
  id: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  items: { id: string; name: string }[];
  createdAt: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { id } = await params;
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params]);

  if (status === "loading" || loading) {
    return <LoadingSpinner fullScreen text="Loading order details..." />;
  }

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "DENIED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isStatusUpdateAllowed = (newStatus: string) => {
    if (updating) return false;
    if (order.status === "COMPLETED" || order.status === "DENIED") return false;
    if (order.status === "APPROVED" && newStatus === "PENDING") return false;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 relative">
      {updating && <LoadingSpinner overlay text="Updating order status..." />}
      <div className="mb-6">
        <Link
          href="/dashboard/orders"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="mt-1 text-sm text-gray-500">ID: {order.id}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
              <dl className="mt-2 text-sm text-gray-500">
                <div className="mt-1">
                  <dt className="inline">Created: </dt>
                  <dd className="inline">{new Date(order.createdAt).toLocaleString()}</dd>
                </div>
                <div className="mt-1">
                  <dt className="inline">Customer: </dt>
                  <dd className="inline">{order.user.name || order.user.email}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="py-2">
                    <Link href={`/dashboard/inventory/${item.id}`} className="text-sm text-indigo-600 hover:text-indigo-900">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleUpdateStatus("APPROVED")}
              disabled={!isStatusUpdateAllowed("APPROVED")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus("DENIED")}
              disabled={!isStatusUpdateAllowed("DENIED")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deny
            </button>
            <button
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={!isStatusUpdateAllowed("COMPLETED")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 