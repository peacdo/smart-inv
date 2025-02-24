"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { ItemStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface ItemCatalog {
  id: string;
  name: string;
  description: string | null;
  minimumStockLevel: number;
  reorderPoint: number;
  status: ItemStatus;
  category: {
    id: string;
    name: string;
  } | null;
  suppliers: Array<{
    supplier: {
      id: string;
      name: string;
    };
    unitPrice: number;
    isPreferred: boolean;
  }>;
}

interface Category {
  id: string;
  name: string;
}

export default function ItemCatalogsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [itemCatalogs, setItemCatalogs] = useState<ItemCatalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetchItemCatalogs(),
    ]).then(([categoriesData]) => {
      setCategories(categoriesData);
      setIsLoading(false);
    });
  }, [currentPage, search, categoryFilter, statusFilter]);

  async function fetchItemCatalogs() {
    try {
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(search && { search }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/item-catalogs?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item catalogs");
      }

      const data = await response.json();
      setItemCatalogs(data.items);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Error fetching item catalogs:", error);
      toast.error("Failed to fetch item catalogs");
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/item-catalogs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete item catalog");
      }

      toast.success("Item catalog deleted successfully");
      fetchItemCatalogs();
    } catch (error) {
      console.error("Error deleting item catalog:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete item catalog"
      );
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Item Catalogs</h1>
        <Button onClick={() => router.push("/dashboard/item-catalogs/new")}>
          Add New Item Catalog
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search item catalogs..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Select
          value={categoryFilter}
          onValueChange={(value: string) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value: string) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      ) : itemCatalogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No item catalogs found</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4">
            {itemCatalogs.map((itemCatalog) => (
              <div
                key={itemCatalog.id}
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{itemCatalog.name}</h2>
                    {itemCatalog.description && (
                      <p className="text-gray-600 mt-1">
                        {itemCatalog.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/item-catalogs/${itemCatalog.id}`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(itemCatalog.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{itemCatalog.category?.name || "Uncategorized"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>{itemCatalog.status.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Min. Stock Level</p>
                    <p>{itemCatalog.minimumStockLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reorder Point</p>
                    <p>{itemCatalog.reorderPoint}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Suppliers</p>
                  <div className="grid gap-2">
                    {itemCatalog.suppliers.map((supplier) => (
                      <div
                        key={supplier.supplier.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          {supplier.isPreferred && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Preferred
                            </span>
                          )}
                          <span>{supplier.supplier.name}</span>
                        </div>
                        <span className="font-medium">
                          ${supplier.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4 bg-gray-100 rounded">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 