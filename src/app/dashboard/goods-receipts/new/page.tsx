"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import GoodsReceiptForm from "@/components/forms/GoodsReceiptForm";

export default function NewGoodsReceiptPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Create Goods Receipt</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new goods receipt for an approved purchase order.
        </p>
      </div>
      <div className="mt-6">
        <GoodsReceiptForm />
      </div>
    </div>
  );
} 