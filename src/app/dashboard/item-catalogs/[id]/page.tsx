"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ItemCatalogForm } from "@/components/forms/item-catalog-form";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditItemCatalogPage({ params }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [itemCatalog, setItemCatalog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/item-catalogs/${params.id}`).then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/suppliers").then((res) => res.json()),
    ])
      .then(([itemCatalogData, categoriesData, suppliersData]) => {
        setItemCatalog(itemCatalogData);
        setCategories(categoriesData);
        setSuppliers(suppliersData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
        setIsLoading(false);
      });
  }, [params.id]);

  function handleSuccess() {
    toast.success("Item catalog updated successfully");
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
      <h1 className="text-2xl font-bold mb-6">Edit Item Catalog</h1>
      <ItemCatalogForm
        initialData={itemCatalog}
        categories={categories}
        suppliers={suppliers}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 