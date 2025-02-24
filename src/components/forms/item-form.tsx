"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ItemStatus } from "@prisma/client"
import { itemSchema } from "@/lib/utils/validation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingSpinner from "@/components/LoadingSpinner"
import { toast } from "sonner"

interface ItemCatalog {
  id: string
  name: string
  description?: string | null
  dimensions?: string | null
  weight?: number | null
  storageConditions?: string | null
  handlingInstructions?: string | null
  minimumStockLevel: number
  reorderPoint: number
  categoryId?: string | null
  status: ItemStatus
  suppliers: Array<{
    supplier: {
      id: string
      name: string
    }
    unitPrice: number
    leadTime?: number | null
    minimumOrderQty: number
    packSize: number
    isPreferred: boolean
    supplierSku?: string | null
  }>
}

interface Supplier {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface ItemFormProps {
  initialData?: {
    id?: string
    name: string
    description?: string | null
    dimensions?: string | null
    weight?: number | null
    storageConditions?: string | null
    handlingInstructions?: string | null
    stockLevel: number
    warehouse: string
    aisle: string
    shelf: string
    expiryDate?: string | null
    status: ItemStatus
    supplierId: string
    categoryId?: string | null
    itemCatalogId?: string | null
  }
  onSuccess?: () => void
}

type ItemFormData = z.infer<typeof itemSchema>;

export function ItemForm({ initialData, onSuccess }: ItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [itemCatalogs, setItemCatalogs] = useState<ItemCatalog[]>([])

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      dimensions: initialData?.dimensions || "",
      weight: initialData?.weight || null,
      storageConditions: initialData?.storageConditions || "",
      handlingInstructions: initialData?.handlingInstructions || "",
      stockLevel: initialData?.stockLevel || 0,
      warehouse: initialData?.warehouse || "",
      aisle: initialData?.aisle || "",
      shelf: initialData?.shelf || "",
      expiryDate: initialData?.expiryDate || "",
      status: initialData?.status || ItemStatus.AVAILABLE,
      supplierId: initialData?.supplierId || "",
      categoryId: initialData?.categoryId || "",
      itemCatalogId: initialData?.itemCatalogId || "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, categoriesRes, itemCatalogsRes] = await Promise.all([
          fetch("/api/suppliers").catch(() => ({ ok: false, json: async () => [] } as Response)),
          fetch("/api/categories").catch(() => ({ ok: false, json: async () => [] } as Response)),
          fetch("/api/item-catalogs").catch(() => ({ ok: false, json: async () => [] } as Response)),
        ])

        if (!suppliersRes.ok || !categoriesRes.ok || !itemCatalogsRes.ok) {
          throw new Error("Failed to fetch data. Please ensure all required API endpoints are available.")
        }

        const [suppliersData, categoriesData, itemCatalogsData] = await Promise.all([
          suppliersRes.json(),
          categoriesRes.json(),
          itemCatalogsRes.json(),
        ])

        setSuppliers(suppliersData)
        setCategories(categoriesData)
        setItemCatalogs(itemCatalogsData.items || itemCatalogsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error(error instanceof Error ? error.message : "Failed to fetch data")
      }
    }

    fetchData()
  }, [])

  const handleItemCatalogChange = (selectedCatalogId: string) => {
    if (selectedCatalogId === "_none") {
      // Reset form values when "None" is selected
      form.setValue("name", "")
      form.setValue("description", "")
      form.setValue("dimensions", "")
      form.setValue("weight", null)
      form.setValue("storageConditions", "")
      form.setValue("handlingInstructions", "")
      form.setValue("categoryId", "")
      form.setValue("status", ItemStatus.AVAILABLE)
      form.setValue("stockLevel", 0)
      form.setValue("itemCatalogId", "_none")
      return
    }

    if (!selectedCatalogId) return

    const selectedCatalog = itemCatalogs.find(
      (catalog) => catalog.id === selectedCatalogId
    )
    if (!selectedCatalog) return

    form.setValue("name", selectedCatalog.name)
    form.setValue("description", selectedCatalog.description || "")
    form.setValue("dimensions", selectedCatalog.dimensions || "")
    form.setValue("weight", selectedCatalog.weight || null)
    form.setValue("storageConditions", selectedCatalog.storageConditions || "")
    form.setValue("handlingInstructions", selectedCatalog.handlingInstructions || "")
    form.setValue("categoryId", selectedCatalog.categoryId || "")
    form.setValue("status", selectedCatalog.status)
    form.setValue("stockLevel", selectedCatalog.minimumStockLevel || 0)
    form.setValue("itemCatalogId", selectedCatalog.id)
    
    const preferredSupplier = selectedCatalog.suppliers.find(
      (supplier) => supplier.isPreferred
    )
    if (preferredSupplier) {
      form.setValue("supplierId", preferredSupplier.supplier.id)
    }
  }

  async function onSubmit(data: ItemFormData) {
    try {
      setIsLoading(true)

      // Fill empty optional fields with descriptive text
      const formattedData = {
        ...data,
        description: data.description || "No description provided",
        dimensions: data.dimensions || "No dimensions specified",
        storageConditions: data.storageConditions || "Standard storage conditions",
        handlingInstructions: data.handlingInstructions || "No special handling required",
        warehouse: data.warehouse || "Not assigned",
        aisle: data.aisle || "Not assigned",
        shelf: data.shelf || "Not assigned",
        expiryDate: data.expiryDate || undefined, // Keep this as undefined if not set
        categoryId: data.categoryId || undefined, // Keep this as undefined if not set
        itemCatalogId: data.itemCatalogId === "_none" ? undefined : data.itemCatalogId || undefined, // Keep this logic
      }

      const response = await fetch(
        initialData?.id ? `/api/items/${initialData.id}` : "/api/items",
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }

      toast.success(
        initialData?.id ? "Item updated successfully" : "Item created successfully"
      )
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="itemCatalogId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Item Catalog</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleItemCatalogChange(value)
                    }}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select an item catalog" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {itemCatalogs.map((catalog) => (
                        <SelectItem key={catalog.id} value={catalog.id}>
                          {catalog.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Select a catalog to auto-fill item details
                  </p>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Name *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="Enter item name" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Description</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isLoading} placeholder="No description provided" className="min-h-[100px] bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Physical Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Dimensions</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="e.g., 30x40x50 cm (LxWxH)" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    Format: Length x Width x Height
                  </p>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      value={field.value ?? ""}
                      disabled={isLoading}
                      placeholder="e.g., 1.5"
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Storage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="storageConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Storage Conditions</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="e.g., Room temperature, Keep dry" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="handlingInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Handling Instructions</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="e.g., Fragile, Handle with care" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Warehouse</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="e.g., Main Warehouse" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aisle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Aisle</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="e.g., A1" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shelf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Shelf</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="e.g., S1-B" className="bg-white border-gray-300 text-gray-900 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Expiry Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      disabled={isLoading} 
                      className="bg-white border-gray-300 text-gray-900"
                      min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Stock Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Stock Level *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value}
                      disabled={isLoading}
                      placeholder="0"
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    Current quantity in stock
                  </p>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ItemStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Supplier *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isLoading && <LoadingSpinner size="small" className="mr-2" />}
            {initialData?.id ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 