"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import GoodsReceiptList from "@/components/GoodsReceiptList";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function GoodsReceiptsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner fullScreen size="large" text="Loading..." />;
  }

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Goods Receipts</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all goods receipts including their status, received date, and associated purchase order.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/goods-receipts/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Receipt
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <GoodsReceiptList />
      </div>
    </div>
  );
} 