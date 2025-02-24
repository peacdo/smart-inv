/*
  Warnings:

  - Made the column `supplierId` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_supplierId_fkey";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "supplierId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
