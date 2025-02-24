import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemStatus } from "@prisma/client";
import { createItemCatalogSchema } from "@/lib/utils/validation/item-catalog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";

interface ItemCatalogFormProps {
  initialData?: {
    id?: string;
    name: string;
    description?: string | null;
    dimensions?: string | null;
    weight?: number | null;
    storageConditions?: string | null;
    handlingInstructions?: string | null;
    minimumStockLevel: number;
    reorderPoint: number;
    categoryId?: string | null;
    status: ItemStatus;
    suppliers?: Array<{
      id?: string;
      supplierId: string;
      unitPrice: number;
      leadTime?: number | null;
      minimumOrderQty: number;
      packSize: number;
      isPreferred: boolean;
      supplierSku?: string | null;
    }>;
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
  suppliers: Array<{
    id: string;
    name: string;
  }>;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
  dimensions: string;
  weight: string;
  storageConditions: string;
  handlingInstructions: string;
  minimumStockLevel: string;
  reorderPoint: string;
  categoryId: string;
  status: ItemStatus;
  suppliers: Array<{
    supplierId: string;
    unitPrice: string;
    leadTime: string;
    minimumOrderQty: string;
    packSize: string;
    isPreferred: boolean;
    supplierSku: string;
  }>;
}

export function ItemCatalogForm({
  initialData,
  categories,
  suppliers,
  onSuccess,
}: ItemCatalogFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createItemCatalogSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      dimensions: initialData?.dimensions || "",
      weight: initialData?.weight?.toString() || "",
      storageConditions: initialData?.storageConditions || "",
      handlingInstructions: initialData?.handlingInstructions || "",
      minimumStockLevel: initialData?.minimumStockLevel?.toString() || "5",
      reorderPoint: initialData?.reorderPoint?.toString() || "0",
      categoryId: initialData?.categoryId || "",
      status: initialData?.status || ItemStatus.AVAILABLE,
      suppliers: initialData?.suppliers?.map((supplier) => ({
        supplierId: supplier.supplierId,
        unitPrice: supplier.unitPrice.toString(),
        leadTime: supplier.leadTime?.toString() || "",
        minimumOrderQty: supplier.minimumOrderQty.toString(),
        packSize: supplier.packSize.toString(),
        isPreferred: supplier.isPreferred,
        supplierSku: supplier.supplierSku || "",
      })) || [
        {
          supplierId: "",
          unitPrice: "",
          leadTime: "",
          minimumOrderQty: "1",
          packSize: "1",
          isPreferred: true,
          supplierSku: "",
        },
      ],
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      const response = await fetch(
        initialData?.id
          ? `/api/item-catalogs/${initialData.id}`
          : "/api/item-catalogs",
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            weight: data.weight ? parseFloat(data.weight) : null,
            minimumStockLevel: parseInt(data.minimumStockLevel),
            reorderPoint: parseInt(data.reorderPoint),
            suppliers: data.suppliers.map((supplier) => ({
              ...supplier,
              unitPrice: parseFloat(supplier.unitPrice),
              leadTime: supplier.leadTime ? parseInt(supplier.leadTime) : null,
              minimumOrderQty: parseInt(supplier.minimumOrderQty),
              packSize: parseInt(supplier.packSize),
            })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      toast.success(
        initialData?.id
          ? "Item catalog updated successfully"
          : "Item catalog created successfully"
      );
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensions</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="storageConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Conditions</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="handlingInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handling Instructions</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minimumStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level</FormLabel>
                <FormControl>
                  <Input {...field} type="number" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input {...field} type="number" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="font-medium">Suppliers</h3>
          {form.watch("suppliers").map((_, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`suppliers.${index}.supplierId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`suppliers.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`suppliers.${index}.leadTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (days)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`suppliers.${index}.minimumOrderQty`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`suppliers.${index}.packSize`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pack Size</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`suppliers.${index}.supplierSku`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier SKU</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`suppliers.${index}.isPreferred`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Preferred Supplier</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => {
                    const suppliers = form.getValues("suppliers");
                    suppliers.splice(index, 1);
                    form.setValue("suppliers", suppliers);
                  }}
                >
                  Remove Supplier
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => {
              const suppliers = form.getValues("suppliers");
              suppliers.push({
                supplierId: "",
                unitPrice: "",
                leadTime: "",
                minimumOrderQty: "1",
                packSize: "1",
                isPreferred: false,
                supplierSku: "",
              });
              form.setValue("suppliers", suppliers);
            }}
          >
            Add Supplier
          </Button>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <LoadingSpinner />}
          {initialData?.id ? "Update" : "Create"} Item Catalog
        </Button>
      </form>
    </Form>
  );
} 