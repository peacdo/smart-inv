import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { getCategories, createCategory } from "@/services/categoryService"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return getCategories()
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return createCategory(request)
} 