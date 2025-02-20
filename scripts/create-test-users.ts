import { createTestUsers } from "../src/lib/auth/create-test-users"

async function main() {
  try {
    await createTestUsers()
    console.log("Script completed successfully")
  } catch (error) {
    console.error("Script failed:", error)
  }
}

main() 