import { hash } from "bcrypt"
import { prisma } from "../prisma"
import { UserRole } from "@prisma/client"

export async function createTestUsers() {
  try {
    const users = [
      {
        email: "worker1@smartinv.com",
        name: "Storage Worker",
        password: "worker123",
        role: "WORKER1" as UserRole,
      },
      {
        email: "worker2@smartinv.com",
        name: "Order Handler",
        password: "worker123",
        role: "WORKER2" as UserRole,
      },
    ]

    for (const user of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        console.log(`User ${user.email} already exists`)
        continue
      }

      const hashedPassword = await hash(user.password, 10)

      const createdUser = await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      })

      console.log(`Created ${user.role} user:`, createdUser.email)
    }
  } catch (error) {
    console.error("Error creating test users:", error)
  }
} 