import { createAdminUser } from "../src/lib/auth/create-admin"

async function main() {
  try {
    await createAdminUser()
    console.log("Admin user setup completed successfully")
  } catch (error) {
    console.error("Failed to setup admin user:", error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 