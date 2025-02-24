"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Item {
  id: string;
  name: string;
  stockLevel: number;
  status: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface SelectedItem {
  id: string;
  quantity: number;
  name: string;
  stockLevel: number;
}

export default function NewOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available items
        const itemsResponse = await fetch("/api/items");
        if (!itemsResponse.ok) {
          throw new Error("Failed to fetch items");
        }
        const itemsData = await itemsResponse.json();
        setItems(itemsData);

        // Fetch users
        const usersResponse = await fetch("/api/users");
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate user selection
    if (!selectedUser) {
      setError("Please select a user for the order");
      return;
    }

    // Validate item selection
    if (selectedItems.length === 0) {
      setError("Please select at least one item");
      return;
    }

    // Validate quantities and stock levels
    const invalidItems = selectedItems.filter(item => {
      return item.quantity <= 0 || item.quantity > item.stockLevel;
    });

    if (invalidItems.length > 0) {
      setError(
        `Invalid quantities for: ${invalidItems
          .map(item => `${item.name} (Max: ${item.stockLevel})`)
          .join(", ")}`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          items: selectedItems.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      router.push("/dashboard/orders");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItemSelection = (item: Item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, { id: item.id, name: item.name, quantity: 1, stockLevel: item.stockLevel }];
    });
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stockLevel) } : item
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
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
          <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Items</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      selectedItems.some((selected) => selected.id === item.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleItemSelection(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Stock: {item.stockLevel}</p>
                      </div>
                      {selectedItems.some((selected) => selected.id === item.id) && (
                        <input
                          type="number"
                          min="1"
                          max={item.stockLevel}
                          value={selectedItems.find((selected) => selected.id === item.id)?.quantity || 1}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href="/dashboard/orders"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0 || !selectedUser}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 