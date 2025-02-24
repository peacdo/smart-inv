"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  const roleSpecificContent = {
    ADMIN: {
      title: "Admin Dashboard",
      description: "Manage your inventory, users, and system settings.",
      stats: [
        { name: "Total Items", value: "0" },
        { name: "Total Users", value: "3" },
        { name: "Pending Requests", value: "0" },
        { name: "Low Stock Items", value: "0" },
      ],
    },
    WORKER1: {
      title: "Storage Dashboard",
      description: "Manage inventory levels and item locations.",
      stats: [
        { name: "Total Items", value: "0" },
        { name: "Low Stock Items", value: "0" },
        { name: "Pending Restocks", value: "0" },
        { name: "Items to Check", value: "0" },
      ],
    },
    WORKER2: {
      title: "Order Handler Dashboard",
      description: "Manage orders and item requests.",
      stats: [
        { name: "Pending Orders", value: "0" },
        { name: "Processing Orders", value: "0" },
        { name: "Completed Today", value: "0" },
        { name: "Items to Pack", value: "0" },
      ],
    },
  }

  const content = roleSpecificContent[session.user.role as keyof typeof roleSpecificContent] || {
    title: "Dashboard",
    description: "Welcome to the dashboard.",
    stats: [],
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{content.title}</h1>
        <p className="mt-2 text-sm text-gray-700">{content.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {content.stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  )
} 