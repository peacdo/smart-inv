import { hash } from "bcrypt"
import { prisma } from "../prisma"

export async function createAdminUser() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    const hashedPassword = await hash("admin123", 10)

    const admin = await prisma.user.create({
      data: {
        email: "admin@smartinv.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log("Admin user created:", admin.email)
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
} 