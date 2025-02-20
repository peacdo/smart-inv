import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: UserRole
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
    }
  }
} 