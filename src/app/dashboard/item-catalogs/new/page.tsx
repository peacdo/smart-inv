"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ItemCatalogForm } from "@/components/forms/item-catalog-form";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export default function NewItemCatalogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/suppliers").then((res) => res.json()),
    ])
      .then(([categoriesData, suppliersData]) => {
        setCategories(categoriesData);
        setSuppliers(suppliersData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
        setIsLoading(false);
      });
  }, []);

  function handleSuccess() {
    toast.success("Item catalog created successfully");
    router.push("/dashboard/item-catalogs");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Item Catalog</h1>
      <ItemCatalogForm
        categories={categories}
        suppliers={suppliers}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 