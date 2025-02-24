"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

interface PurchaseOrder {
  id: string;
  supplier: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    item: {
      id: string;
      name: string;
    };
    quantity: number;
    receivedQty: number;
    unitPrice: number;
  }>;
}

interface FormItem {
  itemId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

interface FormData {
  purchaseOrderId: string;
  items: FormItem[];
  notes?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function GoodsReceiptForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingPOs, setFetchingPOs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState<FormData>({
    purchaseOrderId: "",
    items: [],
    notes: "",
  });

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const response = await fetch("/api/purchase-orders");
        if (!response.ok) {
          throw new Error("Failed to fetch purchase orders");
        }
        const data = await response.json();
        console.log("Fetched Purchase Orders:", data);
        setPurchaseOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch purchase orders");
      } finally {
        setFetchingPOs(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const handlePOChange = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    console.log("Selected Purchase Order:", po);
    setSelectedPO(po || null);
    setFormData({
      purchaseOrderId: poId,
      items: po ? po.items.map(item => ({
        itemId: item.item.id,
        quantity: item.quantity - item.receivedQty,
      })) : [],
      notes: "",
    });
    setValidationErrors([]);
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: string | number) => {
    const newItems = [...formData.items];
    const poItem = selectedPO?.items.find(i => i.item.id === newItems[index].itemId);
    
    if (field === "quantity" && poItem) {
      const remainingQty = poItem.quantity - poItem.receivedQty;
      const newQty = Number(value);
      
      // Validate quantity
      if (newQty > remainingQty) {
        setValidationErrors(prev => [
          ...prev.filter(e => e.field !== `quantity-${index}`),
          {
            field: `quantity-${index}`,
            message: `Cannot exceed remaining quantity of ${remainingQty}`,
          },
        ]);
        return;
      } else {
        setValidationErrors(prev => prev.filter(e => e.field !== `quantity-${index}`));
      }
    }

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData({ ...formData, items: newItems });
  };

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.purchaseOrderId) {
      errors.push({
        field: "purchaseOrderId",
        message: "Please select a purchase order",
      });
    }

    formData.items.forEach((item, index) => {
      const poItem = selectedPO?.items.find(i => i.item.id === item.itemId);
      if (poItem) {
        const remainingQty = poItem.quantity - poItem.receivedQty;
        if (item.quantity <= 0) {
          errors.push({
            field: `quantity-${index}`,
            message: "Quantity must be greater than 0",
          });
        } else if (item.quantity > remainingQty) {
          errors.push({
            field: `quantity-${index}`,
            message: `Cannot exceed remaining quantity of ${remainingQty}`,
          });
        }

        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate);
          if (expiryDate < new Date()) {
            errors.push({
              field: `expiryDate-${index}`,
              message: "Expiry date cannot be in the past",
            });
          }
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/goods-receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create goods receipt");
      }

      router.push("/dashboard/goods-receipts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goods receipt");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPOs) {
    return <LoadingSpinner size="large" text="Loading purchase orders..." />;
  }

  if (loading) {
    return <LoadingSpinner overlay text="Creating goods receipt..." />;
  }

  const getFieldError = (field: string) => 
    validationErrors.find(error => error.field === field)?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="purchaseOrderId" className="block text-sm font-medium text-gray-700">
          Purchase Order *
        </label>
        <select
          id="purchaseOrderId"
          name="purchaseOrderId"
          required
          value={formData.purchaseOrderId}
          onChange={(e) => handlePOChange(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            getFieldError("purchaseOrderId") ? "border-red-300" : ""
          }`}
        >
          <option value="">Select a purchase order</option>
          {purchaseOrders.map((po) => (
            <option key={po.id} value={po.id}>
              {po.id} - {po.supplier.name}
            </option>
          ))}
        </select>
        {getFieldError("purchaseOrderId") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError("purchaseOrderId")}</p>
        )}
      </div>

      {selectedPO && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          {formData.items.map((item, index) => {
            const poItem = selectedPO.items.find(i => i.item.id === item.itemId);
            if (!poItem) return null;

            return (
              <div key={item.itemId} className="border rounded-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{poItem.item.name}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      id={`quantity-${index}`}
                      required
                      min="1"
                      max={poItem.quantity - poItem.receivedQty}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10))}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        getFieldError(`quantity-${index}`) ? "border-red-300" : ""
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Remaining: {poItem.quantity - poItem.receivedQty}
                    </p>
                    {getFieldError(`quantity-${index}`) && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError(`quantity-${index}`)}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`batchNumber-${index}`} className="block text-sm font-medium text-gray-700">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      id={`batchNumber-${index}`}
                      value={item.batchNumber || ""}
                      onChange={(e) => handleItemChange(index, "batchNumber", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor={`expiryDate-${index}`} className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id={`expiryDate-${index}`}
                      value={item.expiryDate || ""}
                      onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        getFieldError(`expiryDate-${index}`) ? "border-red-300" : ""
                      }`}
                    />
                    {getFieldError(`expiryDate-${index}`) && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError(`expiryDate-${index}`)}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Add any additional notes about this receipt..."
            />
          </div>
        </div>
      )}

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
          disabled={loading || !selectedPO || formData.items.length === 0 || validationErrors.length > 0}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Create Receipt
        </button>
      </div>
    </form>
  );
} 