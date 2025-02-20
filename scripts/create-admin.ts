import { createAdminUser } from "../src/lib/auth/create-admin"

async function main() {
  try {
    await createAdminUser()
    console.log("Script completed successfully")
  } catch (error) {
    console.error("Script failed:", error)
  }
}

main() 