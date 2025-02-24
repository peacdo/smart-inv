"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { use } from "react";

interface GoodsReceipt {
  id: string;
  receivedDate: string;
  status: string;
  notes?: string;
  receivedBy: {
    name: string;
    email: string;
  };
  purchaseOrder: {
    id: string;
    totalAmount: number;
    supplier: {
      id: string;
      name: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: string;
    item: {
      id: string;
      name: string;
      stockLevel: number;
    };
  }>;
}

export default function GoodsReceiptDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(`/api/goods-receipts/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch goods receipt");
        }
        const data = await response.json();
        setReceipt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [resolvedParams.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this receipt as ${newStatus}?`)) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/goods-receipts/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedReceipt = await response.json();
      setReceipt(updatedReceipt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (status === "loading" || loading) {
    return <LoadingSpinner fullScreen text="Loading receipt details..." />;
  }

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    router.push("/dashboard");
    return null;
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => router.push("/dashboard/goods-receipts")}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Go back to goods receipts
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {updating && <LoadingSpinner overlay text="Updating receipt status..." />}
      <div className="mb-6">
        <Link
          href="/dashboard/goods-receipts"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Goods Receipts
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Goods Receipt Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Receipt ID: {receipt.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(receipt.status)}`}>
            {receipt.status}
          </span>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Received By</dt>
              <dd className="mt-1 text-sm text-gray-900">{receipt.receivedBy.name || receipt.receivedBy.email}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Received Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(receipt.receivedDate).toLocaleString()}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Purchase Order</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <Link
                  href={`/dashboard/purchase-orders/${receipt.purchaseOrder.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {receipt.purchaseOrder.id}
                </Link>
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Supplier</dt>
              <dd className="mt-1 text-sm text-gray-900">{receipt.purchaseOrder.supplier.name}</dd>
            </div>

            {receipt.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">{receipt.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900">Received Items</h4>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Item
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Quantity
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Batch Number
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Expiry Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receipt.items.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <Link
                            href={`/dashboard/inventory/${item.item.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {item.item.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.batchNumber || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {session?.user.role === "ADMIN" && receipt.status === "PENDING" && (
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
            <button
              onClick={() => handleStatusUpdate("COMPLETED")}
              className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Complete Receipt
            </button>
            <button
              onClick={() => handleStatusUpdate("REJECTED")}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reject Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 