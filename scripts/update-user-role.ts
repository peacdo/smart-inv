import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'gorkemozyilmaz@outlook.com';
  const newRole = 'ADMIN';

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User with email ${email} not found.`);
    return;
  }

  // Update the user's role
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: newRole },
  });

  console.log(`User ${updatedUser.name} is now an ${newRole}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 