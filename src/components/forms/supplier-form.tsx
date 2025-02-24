import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
}

interface SupplierFormProps {
  initialData?: {
    id?: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    taxId?: string | null;
    website?: string | null;
    paymentTerms?: string | null;
    currency?: string | null;
    diversityStatus?: string | null;
    categories?: Category[];
  };
  categories: Category[];
  onSuccess?: () => void;
}

export function SupplierForm({ initialData, categories, onSuccess }: SupplierFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
    taxId: initialData?.taxId || '',
    website: initialData?.website || '',
    paymentTerms: initialData?.paymentTerms || '',
    currency: initialData?.currency || 'USD',
    diversityStatus: initialData?.diversityStatus || '',
    categories: initialData?.categories?.map(c => c.id) || [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, categories: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id
        ? `/api/suppliers/${initialData.id}`
        : '/api/suppliers';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      toast.success(
        initialData?.id
          ? 'Supplier updated successfully'
          : 'Supplier created successfully'
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/suppliers');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {loading && <LoadingSpinner overlay />}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <Input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
            Tax ID
          </label>
          <Input
            id="taxId"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        <div>
          <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
            Payment Terms
          </label>
          <Input
            id="paymentTerms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="diversityStatus" className="block text-sm font-medium text-gray-700">
            Diversity Status
          </label>
          <Input
            id="diversityStatus"
            name="diversityStatus"
            value={formData.diversityStatus}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
          Categories
        </label>
        <select
          id="categories"
          name="categories"
          multiple
          value={formData.categories}
          onChange={handleCategoryChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {initialData?.id ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
} 