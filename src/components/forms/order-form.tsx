import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderFormProps {
  onSuccess?: () => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    items: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      if (onSuccess) {
        onSuccess();
      }
      router.push("/dashboard/orders");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <LoadingSpinner overlay text="Creating order..." />;
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            User ID *
          </label>
          <input
            type="text"
            id="userId"
            name="userId"
            required
            value={formData.userId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="items" className="block text-sm font-medium text-gray-700">
            Item IDs (comma-separated) *
          </label>
          <input
            type="text"
            id="items"
            name="items"
            required
            value={formData.items.join(", ")}
            onChange={(e) => setFormData({ ...formData, items: e.target.value.split(", ") })}
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
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
} 