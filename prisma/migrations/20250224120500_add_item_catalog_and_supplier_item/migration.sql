/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `handlingInstructions` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `lastPurchaseDate` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `maximumStock` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `minimumStock` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `minimumStockLevel` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `reorderPoint` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `storageConditions` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Item` table. All the data in the column will be lost.
  - Added the required column `itemCatalogId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_categoryId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "categoryId",
DROP COLUMN "description",
DROP COLUMN "dimensions",
DROP COLUMN "handlingInstructions",
DROP COLUMN "image",
DROP COLUMN "lastPurchaseDate",
DROP COLUMN "maximumStock",
DROP COLUMN "minimumStock",
DROP COLUMN "minimumStockLevel",
DROP COLUMN "name",
DROP COLUMN "reorderPoint",
DROP COLUMN "storageConditions",
DROP COLUMN "unitCost",
DROP COLUMN "weight",
ADD COLUMN     "batchNumber" TEXT,
ADD COLUMN     "itemCatalogId" TEXT NOT NULL,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "ItemCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dimensions" TEXT,
    "weight" DOUBLE PRECISION,
    "storageConditions" TEXT,
    "handlingInstructions" TEXT,
    "minimumStockLevel" INTEGER NOT NULL DEFAULT 5,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ItemCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierItem" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "itemCatalogId" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "leadTime" INTEGER,
    "minimumOrderQty" INTEGER NOT NULL DEFAULT 1,
    "packSize" INTEGER NOT NULL DEFAULT 1,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "supplierSku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierItem_supplierId_itemCatalogId_key" ON "SupplierItem"("supplierId", "itemCatalogId");

-- AddForeignKey
ALTER TABLE "ItemCatalog" ADD CONSTRAINT "ItemCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCatalog" ADD CONSTRAINT "ItemCatalog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_itemCatalogId_fkey" FOREIGN KEY ("itemCatalogId") REFERENCES "ItemCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_itemCatalogId_fkey" FOREIGN KEY ("itemCatalogId") REFERENCES "ItemCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
