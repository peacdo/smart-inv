import { PrismaClient, UserRole, OrderStatus, RequestType, RequestStatus } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartinv.com' },
    update: {},
    create: {
      email: 'admin@smartinv.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: '$2b$10$EprqryT7YxhKJqoHuHhKu.zKQN9D.6HOZzj8N.7UZqTXOr4LO5HRW' // "admin123"
    },
  })

  // Create a regular user for orders
  const user = await prisma.user.upsert({
    where: { email: 'user@smartinv.com' },
    update: {},
    create: {
      email: 'user@smartinv.com',
      name: 'Test User',
      role: UserRole.USER,
      password: '$2b$10$EprqryT7YxhKJqoHuHhKu.zKQN9D.6HOZzj8N.7UZqTXOr4LO5HRW' // "admin123"
    },
  })

  // Create a test supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Test Supplier',
      email: 'supplier@test.com',
      phone: '1234567890',
      address: '123 Test St',
      notes: 'Test supplier for development'
    }
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
    }),
    prisma.category.create({
      data: {
        name: 'Safety Equipment',
        description: 'Personal protective equipment and safety gear'
      }
    })
  ])

  // Create items
  const items = await Promise.all([
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
        categoryId: categories[0].id,
        warehouse: 'Main',
        aisle: 'A1',
        shelf: 'S1',
        status: 'AVAILABLE',
        userId: admin.id,
        supplierId: supplier.id
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
        categoryId: categories[0].id,
        warehouse: 'Main',
        aisle: 'A1',
        shelf: 'S2',
        status: 'AVAILABLE',
        userId: admin.id,
        supplierId: supplier.id
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
        categoryId: categories[1].id,
        warehouse: 'Main',
        aisle: 'B2',
        shelf: 'S1',
        status: 'LOW_STOCK',
        userId: admin.id,
        supplierId: supplier.id
      }
    }),
    // Tools
    prisma.item.create({
      data: {
        name: 'Power Drill',
        description: 'Cordless power drill with battery pack',
        dimensions: '25x20x8 cm',
        weight: 1.8,
        storageConditions: 'Keep in dry place',
        handlingInstructions: 'Check battery charge before use',
        stockLevel: 0,
        categoryId: categories[2].id,
        warehouse: 'Main',
        aisle: 'C1',
        shelf: 'S3',
        status: 'OUT_OF_STOCK',
        userId: admin.id,
        supplierId: supplier.id
      }
    }),
    // Safety Equipment
    prisma.item.create({
      data: {
        name: 'Safety Helmet',
        description: 'Type II hard hat with adjustable suspension',
        dimensions: '22x18x15 cm',
        weight: 0.4,
        storageConditions: 'Store away from direct sunlight',
        handlingInstructions: 'Inspect for damage before each use',
        stockLevel: 25,
        categoryId: categories[3].id,
        warehouse: 'Main',
        aisle: 'D1',
        shelf: 'S1',
        status: 'AVAILABLE',
        userId: admin.id,
        supplierId: supplier.id
      }
    })
  ])

  // Create orders with current dates
  const now = new Date();
  console.log('Current date for order creation:', now.toISOString());
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const currentDay = now.getUTCDate();

  const orderDates = [
    new Date(Date.UTC(currentYear, currentMonth, currentDay)),
    new Date(Date.UTC(currentYear, currentMonth, currentDay - 1)),     // 1 day ago
    new Date(Date.UTC(currentYear, currentMonth, currentDay - 2)), // 2 days ago
    new Date(Date.UTC(currentYear, currentMonth, currentDay - 3)), // 3 days ago
    new Date(Date.UTC(currentYear, currentMonth, currentDay - 4)), // 4 days ago
    new Date(Date.UTC(currentYear, currentMonth, currentDay - 5)), // 5 days ago
    new Date(Date.UTC(currentYear, currentMonth, currentDay - 6))  // 6 days ago
  ]

  // Create orders with specific statuses and items
  for (const date of orderDates) {
    // Create 2-3 orders per day with different statuses
    const numOrders = Math.floor(Math.random() * 2) + 2 // 2-3 orders
    
    for (let i = 0; i < numOrders; i++) {
      // Assign different statuses based on date
      let status
      if (date.getTime() === orderDates[0].getTime()) {
        status = OrderStatus.PENDING
      } else if (date.getTime() <= orderDates[5].getTime()) {
        status = OrderStatus.COMPLETED
      } else {
        status = [OrderStatus.PENDING, OrderStatus.APPROVED, OrderStatus.COMPLETED, OrderStatus.CANCELLED][
          Math.floor(Math.random() * 4)
        ]
      }

      // Select 1-3 random items for each order
      const numItems = Math.floor(Math.random() * 3) + 1
      const selectedItems = items
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems)

      await prisma.order.create({
        data: {
          userId: user.id,
          status,
          items: {
            connect: selectedItems.map(item => ({ id: item.id }))
          },
          createdAt: date,
          updatedAt: date
        }
      })
    }
  }

  // Create sample requests
  const requestTypes = [RequestType.CHECKOUT, RequestType.RETURN, RequestType.RESTOCK, RequestType.MAINTENANCE]
  const requestStatuses = [RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.DENIED, RequestStatus.COMPLETED]

  for (const date of orderDates.slice(0, 5)) { // Create requests for the last 5 days
    const numRequests = Math.floor(Math.random() * 2) + 1 // 1-2 requests per day
    
    for (let i = 0; i < numRequests; i++) {
      const type = requestTypes[Math.floor(Math.random() * requestTypes.length)]
      const status = requestStatuses[Math.floor(Math.random() * requestStatuses.length)]
      const item = items[Math.floor(Math.random() * items.length)]
      
      await prisma.request.create({
        data: {
          type,
          status,
          itemId: item.id,
          userId: user.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          notes: `Sample ${type.toLowerCase()} request for ${item.name}`,
          createdAt: date,
          updatedAt: date
        }
      })
    }
  }

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