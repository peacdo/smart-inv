const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      createdAt: true,
      status: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('Orders:', orders);
  orders.forEach(order => {
    console.log(`Order ID: ${order.id}, Created At: ${order.createdAt}, Status: ${order.status}, User: ${order.user.name || order.user.email}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 