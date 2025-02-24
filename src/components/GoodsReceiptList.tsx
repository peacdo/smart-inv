"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";

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
      name: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    item: {
      id: string;
      name: string;
    };
  }>;
}

export default function GoodsReceiptList() {
  const { data: session } = useSession();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetch("/api/goods-receipts");
        if (!response.ok) {
          throw new Error("Failed to fetch goods receipts");
        }
        const data = await response.json();
        setReceipts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this receipt as ${newStatus.toLowerCase()}?`)) {
      return;
    }

    setUpdating(id);
    setError(null);

    try {
      const response = await fetch(`/api/goods-receipts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      const updatedReceipt = await response.json();
      setReceipts(receipts.map(receipt => 
        receipt.id === id ? updatedReceipt : receipt
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredReceipts = receipts.filter(receipt => 
    receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.purchaseOrder.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const currentReceipts = filteredReceipts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return <LoadingSpinner size="large" text="Loading goods receipts..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredReceipts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new goods receipt.</p>
        <div className="mt-6">
          <Link
            href="/dashboard/goods-receipts/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Receipt
          </Link>
        </div>
      </div>
    );
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
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      {updating && <LoadingSpinner overlay text="Updating receipt status..." />}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search receipts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-md p-2"
        />
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
              Receipt ID
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              PO Reference
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Supplier
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Received By
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Date
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {currentReceipts.map((receipt) => (
            <tr key={receipt.id} className={updating === receipt.id ? "opacity-50" : ""}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {receipt.id}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <Link
                  href={`/dashboard/purchase-orders/${receipt.purchaseOrder.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {receipt.purchaseOrder.id}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {receipt.purchaseOrder.supplier.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {receipt.receivedBy.name || receipt.receivedBy.email}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(receipt.status)}`}>
                  {receipt.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(receipt.receivedDate).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Link
                  href={`/dashboard/goods-receipts/${receipt.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View<span className="sr-only">, {receipt.id}</span>
                </Link>
                {session?.user.role === "ADMIN" && receipt.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(receipt.id, "COMPLETED")}
                      disabled={updating === receipt.id}
                      className="ml-4 text-green-600 hover:text-green-900"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(receipt.id, "REJECTED")}
                      disabled={updating === receipt.id}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 