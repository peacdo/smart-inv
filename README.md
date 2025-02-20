# Smart Inventory Management System

A modern, role-based inventory management system built with Next.js 14, featuring QR code integration for efficient item tracking.

## Project Overview

Smart Inventory is designed to streamline inventory management processes through:
- Role-based access control
- QR code integration for item tracking
- Real-time inventory updates
- Order management
- User management

## Features

### Phase 1: Authentication and Core Setup ✅
- **Authentication System**
  - Secure login/logout with NextAuth.js
  - Role-based access control (ADMIN, WORKER1, WORKER2)
  - Protected routes and middleware
  - Session management with JWT
  - Password hashing with bcrypt

- **User Management**
  - Admin dashboard for user management
  - Role assignment and management
  - User profile management
  - Activity tracking

- **Dashboard**
  - Role-specific views and layouts
  - Key metrics and statistics
  - Recent activity tracking
  - Quick access to common functions

### Phase 2: Inventory Management ✅
- **Item Tracking with QR Codes**
  - QR code generation for each item
  - Multiple QR codes per item support
  - Public item view pages
  - QR code download functionality
  - Easy URL sharing

- **Stock Management**
  - Real-time stock level monitoring
  - Automatic status updates
  - Low stock alerts based on minimum levels
  - Stock history tracking
  - Stock movement logging

- **Location Management**
  - Structured warehouse organization
  - Aisle and shelf tracking
  - Location-based inventory organization
  - Easy item location lookup

- **Item Details**
  - Comprehensive item information
  - Expiry date tracking
  - Storage conditions
  - Handling instructions
  - Physical specifications (dimensions, weight)
  - Category assignment

- **Status and Categorization**
  - Multiple status types:
    - AVAILABLE
    - LOW_STOCK
    - OUT_OF_STOCK
    - EXPIRED
    - DAMAGED
  - Visual status indicators
  - Category-based organization
  - Flexible category management

### Phase 3: Order Processing 🚧
- Order creation and management (Pending)
- Request handling system (Pending)
- Stock movement tracking (Pending)
- Order history and analytics (Pending)

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Container**: Docker
- **Type Safety**: TypeScript
- **QR Code**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18 or later
- Docker
- npm or yarn
- PostgreSQL (via Docker)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd smart-inv
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the database:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Seed the database:
```bash
npx prisma db seed
```

7. Start the development server:
```bash
npm run dev
```

### Default Users

The system comes with pre-configured users:

1. **Admin User**
   - Email: admin@example.com
   - Password: password123
   - Role: ADMIN
   - Access: Full system access

2. **Storage Worker**
   - Email: worker1@smartinv.com
   - Password: worker123
   - Role: WORKER1
   - Access: Inventory management

3. **Order Handler**
   - Email: worker2@smartinv.com
   - Password: worker123
   - Role: WORKER2
   - Access: Order processing

## Project Structure

```
smart-inv/
├── src/
│   ├── app/              # Next.js 14 app directory
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Protected dashboard routes
│   │   └── i/          # Public item views
│   ├── components/      # React components
│   ├── lib/            # Utility functions and configurations
│   ├── services/       # Business logic and data services
│   └── types/          # TypeScript type definitions
├── prisma/             # Database schema and migrations
├── public/            # Static files
└── scripts/           # Setup and utility scripts
```

## API Routes

### Authentication
- POST `/api/auth/signin` - User login
- POST `/api/auth/signout` - User logout

### Items
- GET `/api/items` - List all items
- POST `/api/items` - Create new item
- GET `/api/items/[id]` - Get item details
- PUT `/api/items/[id]` - Update item
- DELETE `/api/items/[id]` - Delete item

### QR Codes
- GET `/api/items/[id]/qr-code` - Get item QR codes
- POST `/api/items/[id]/qr-code` - Generate new QR code
- DELETE `/api/items/[id]/qr-code` - Delete QR code

### Categories
- GET `/api/categories` - List all categories
- POST `/api/categories` - Create new category
- PUT `/api/categories/[id]` - Update category
- DELETE `/api/categories/[id]` - Delete category

### Stock History
- GET `/api/items/[id]/stock-history` - Get item stock history
- GET `/api/items/[id]/stock-history?type=stats` - Get stock statistics

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT License - See LICENSE file for details
