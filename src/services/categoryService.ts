import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    )
  }
}

export async function createCategory(request: Request) {
  try {
    const json = await request.json()
    const { name, description } = json

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Error creating category" },
      { status: 500 }
    )
  }
}

export async function updateCategory(request: Request, id: string) {
  try {
    const json = await request.json()
    const { name, description } = json

    const existingCategory = await prisma.category.findUnique({
      where: { name, NOT: { id } },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 400 }
      )
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Error updating category" },
      { status: 500 }
    )
  }
}

export async function deleteCategory(id: string) {
  try {
    // Update all items in this category to have no category
    await prisma.item.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    })

    // Delete the category
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Error deleting category" },
      { status: 500 }
    )
  }
} 