"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", role: ["ADMIN", "WORKER1", "WORKER2"] },
    { name: "Inventory", href: "/dashboard/inventory", role: ["ADMIN", "WORKER1"] },
    { name: "Orders", href: "/dashboard/orders", role: ["ADMIN", "WORKER2"] },
    { name: "QR Codes", href: "/dashboard/qr-codes", role: ["ADMIN"] },
    { name: "Users", href: "/dashboard/users", role: ["ADMIN"] },
  ]

  const filteredNavigation = navigation.filter((item) =>
    item.role.includes(session?.user?.role as string)
  )

  const handleSignOut = () => {
    router.push("/signout")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-2xl font-bold text-indigo-600">SmartInv</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === item.href
                        ? "border-b-2 border-indigo-500 text-gray-900"
                        : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium">
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                      </span>
                    </div>
                  </button>
                </div>
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      {session?.user?.name || session?.user?.email}
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Role: {session?.user?.role}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
} 