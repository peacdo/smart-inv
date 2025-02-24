"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  rating: number | null;
  taxId: string | null;
  website: string | null;
  paymentTerms: string | null;
  currency: string | null;
  diversityStatus: string | null;
  riskLevel: string | null;
  onboardingDate: string;
  lastAuditDate: string | null;
  nextAuditDate: string | null;
  categories: Array<{
    id: string;
    name: string;
  }>;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string;
    phone: string | null;
    department: string | null;
    isPrimary: boolean;
  }>;
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    expiryDate: string | null;
    status: string;
  }>;
  qualifications: Array<{
    id: string;
    type: string;
    status: string;
    validFrom: string;
    validUntil: string | null;
    notes: string | null;
  }>;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function SupplierDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/suppliers/${params.id}`),
      fetch(`/api/suppliers/${params.id}/metrics`),
    ])
      .then(async ([supplierRes, metricsRes]) => {
        if (!supplierRes.ok || !metricsRes.ok) {
          throw new Error("Failed to fetch supplier data");
        }
        const [supplierData, metricsData] = await Promise.all([
          supplierRes.json(),
          metricsRes.json(),
        ]);
        setSupplier(supplierData);
        setMetrics(metricsData);
      })
      .catch((err) => {
        setError(err.message);
        toast.error("Failed to fetch supplier data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "BLACKLISTED":
        return "bg-black text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLevelColor = (level: string | null) => {
    switch (level) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !supplier) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error || "Failed to load supplier"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/suppliers/${supplier.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/suppliers/${supplier.id}/documents/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Add Document
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    supplier.status
                  )}`}
                >
                  {supplier.status}
                </span>
                {supplier.riskLevel && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(
                      supplier.riskLevel
                    )}`}
                  >
                    {supplier.riskLevel} Risk
                  </span>
                )}
              </div>
              {supplier.rating && (
                <div className="text-yellow-400">
                  {`★`.repeat(Math.floor(supplier.rating))}
                  <span className="text-gray-300">
                    {`★`.repeat(5 - Math.floor(supplier.rating))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.email || "-"}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.phone || "-"}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {supplier.website ? (
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {supplier.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.taxId || "-"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.address || "-"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Categories</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {supplier.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          {metrics && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {metrics.totalOrders}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      On-Time Delivery Rate
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {metrics.onTimeDeliveryRate.toFixed(1)}%
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Quality Issues</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {metrics.qualityIssues}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Returns</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {metrics.returns}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contacts</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {supplier.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-lg p-4 relative hover:shadow-md transition-shadow"
                >
                  {contact.isPrimary && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Primary
                    </span>
                  )}
                  <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                  {contact.title && (
                    <p className="text-sm text-gray-500">{contact.title}</p>
                  )}
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  {contact.phone && (
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  )}
                  {contact.department && (
                    <p className="text-sm text-gray-500">{contact.department}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {supplier.documents.map((document) => (
                <div
                  key={document.id}
                  className="border rounded-lg p-4 relative hover:shadow-md transition-shadow"
                >
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                      document.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {document.status}
                  </span>
                  <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                  <p className="text-sm text-gray-500">{document.type}</p>
                  {document.expiryDate && (
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(document.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Qualifications</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {supplier.qualifications.map((qualification) => (
                <div
                  key={qualification.id}
                  className="border rounded-lg p-4 relative hover:shadow-md transition-shadow"
                >
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                      qualification.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : qualification.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {qualification.status}
                  </span>
                  <h4 className="text-sm font-medium text-gray-900">
                    {qualification.type}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Valid From: {new Date(qualification.validFrom).toLocaleDateString()}
                  </p>
                  {qualification.validUntil && (
                    <p className="text-sm text-gray-500">
                      Valid Until:{" "}
                      {new Date(qualification.validUntil).toLocaleDateString()}
                    </p>
                  )}
                  {qualification.notes && (
                    <p className="mt-2 text-sm text-gray-500">{qualification.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 