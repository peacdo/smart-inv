import { hash } from "bcrypt"
import { prisma } from "../prisma"

export async function createAdminUser() {
  try {
    // Check if admin exists by email (more specific than just role)
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: "admin@smartinv.com",
      },
    });

    const hashedPassword = await hash("admin123", 10);

    if (existingAdmin) {
      // If admin exists, update the password
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { 
          password: hashedPassword,
          role: "ADMIN", // Ensure role is ADMIN
        },
      });
      console.log("Admin user password reset to: admin123");
      return updatedAdmin;
    }

    // If admin doesn't exist, create new admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@smartinv.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin user created:", admin.email);
    console.log("Admin password set to: admin123");
    return admin;
  } catch (error) {
    console.error("Error managing admin user:", error);
    throw error;
  }
} 