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
  - Secure login/logout
  - Role-based access control (ADMIN, WORKER1, WORKER2)
  - Protected routes
  - Session management

- **User Management**
  - Admin dashboard
  - User role management
  - User creation and editing

- **Dashboard**
  - Role-specific views
  - Key metrics and statistics
  - Recent activity tracking

### Phase 2: Inventory Management 🚧
- Item tracking with QR codes
- Stock level monitoring
- Location management
- Expiry date tracking
- Item categorization

### Phase 3: Order Processing 🚧
- Order creation and management
- Request handling
- Stock movement tracking
- Order history

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Container**: Docker
- **Type Safety**: TypeScript

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

6. Create initial admin user:
```bash
npm run create-admin
```

7. Create test users:
```bash
npm run create-test-users
```

8. Start the development server:
```bash
npm run dev
```

### Default Users

The system comes with three default users:

1. **Admin User**
   - Email: admin@smartinv.com
   - Password: admin123
   - Role: ADMIN

2. **Storage Worker**
   - Email: worker1@smartinv.com
   - Password: worker123
   - Role: WORKER1

3. **Order Handler**
   - Email: worker2@smartinv.com
   - Password: worker123
   - Role: WORKER2

## Project Structure

```
smart-inv/
├── src/
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/             # Static files
└── scripts/            # Setup and utility scripts
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

[License Type] - See LICENSE file for details
