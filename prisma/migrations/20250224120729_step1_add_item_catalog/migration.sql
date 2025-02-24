/*
  Warnings:

  - You are about to drop the column `batchNumber` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemCatalogId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `Item` table. All the data in the column will be lost.
  - Added the required column `name` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_itemCatalogId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "batchNumber",
DROP COLUMN "itemCatalogId",
DROP COLUMN "purchasePrice",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "handlingInstructions" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "storageConditions" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
