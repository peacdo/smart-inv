import { PrismaClient, UserRole } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: '$2b$10$EprqryT7YxhKJqoHuHhKu.zKQN9D.6HOZzj8N.7UZqTXOr4LO5HRW' // "password123"
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and components'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Office Supplies',
        description: 'General office supplies and stationery'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Tools',
        description: 'Hand tools and power tools'
      }
    })
  ])

  // Create items
  await Promise.all([
    // Electronics
    prisma.item.create({
      data: {
        name: 'Laptop',
        description: 'High-performance business laptop',
        dimensions: '35x24x2 cm',
        weight: 2.1,
        storageConditions: 'Keep in dry place',
        handlingInstructions: 'Handle with care, avoid drops',
        stockLevel: 15,
        minimumStockLevel: 5,
        categoryId: categories[0].id,
        warehouse: 'Main',
        aisle: 'A1',
        shelf: 'S1',
        status: 'AVAILABLE',
        userId: admin.id
      }
    }),
    prisma.item.create({
      data: {
        name: 'Monitor',
        description: '27-inch 4K LED Monitor',
        dimensions: '60x35x20 cm',
        weight: 4.5,
        storageConditions: 'Keep in original packaging',
        handlingInstructions: 'Two person lift recommended',
        stockLevel: 8,
        minimumStockLevel: 3,
        categoryId: categories[0].id,
        warehouse: 'Main',
        aisle: 'A1',
        shelf: 'S2',
        status: 'AVAILABLE',
        userId: admin.id
      }
    }),
    // Office Supplies
    prisma.item.create({
      data: {
        name: 'Printer Paper',
        description: 'A4 80gsm white printer paper',
        dimensions: '30x21x25 cm',
        weight: 2.5,
        storageConditions: 'Keep dry and away from direct sunlight',
        handlingInstructions: 'Stack no more than 5 boxes high',
        stockLevel: 2,
        minimumStockLevel: 10,
        categoryId: categories[1].id,
        warehouse: 'Main',
        aisle: 'B2',
        shelf: 'S1',
        status: 'LOW_STOCK',
        userId: admin.id
      }
    }),
    prisma.item.create({
      data: {
        name: 'Stapler',
        description: 'Heavy-duty desktop stapler',
        dimensions: '15x5x8 cm',
        weight: 0.5,
        storageConditions: 'Normal office conditions',
        handlingInstructions: 'Keep away from children',
        stockLevel: 25,
        minimumStockLevel: 5,
        categoryId: categories[1].id,
        warehouse: 'Main',
        aisle: 'B2',
        shelf: 'S3',
        status: 'AVAILABLE',
        userId: admin.id
      }
    }),
    // Tools
    prisma.item.create({
      data: {
        name: 'Power Drill',
        description: 'Cordless power drill with battery pack',
        dimensions: '30x25x10 cm',
        weight: 1.8,
        storageConditions: 'Keep in tool storage',
        handlingInstructions: 'Check battery charge before use',
        stockLevel: 0,
        minimumStockLevel: 2,
        categoryId: categories[2].id,
        warehouse: 'Main',
        aisle: 'C1',
        shelf: 'S1',
        status: 'OUT_OF_STOCK',
        userId: admin.id
      }
    }),
    prisma.item.create({
      data: {
        name: 'Screwdriver Set',
        description: 'Professional 12-piece screwdriver set',
        dimensions: '25x15x5 cm',
        weight: 0.8,
        storageConditions: 'Keep in tool box',
        handlingInstructions: 'Return all pieces to case after use',
        stockLevel: 4,
        minimumStockLevel: 3,
        categoryId: categories[2].id,
        warehouse: 'Main',
        aisle: 'C1',
        shelf: 'S2',
        status: 'LOW_STOCK',
        userId: admin.id
      }
    })
  ])

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 