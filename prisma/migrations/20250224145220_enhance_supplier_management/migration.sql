-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRACT', 'CERTIFICATION', 'INSURANCE', 'LICENSE', 'FINANCIAL', 'COMPLIANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "QualificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'MEETING', 'PHONE', 'AUDIT', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('DRAFT', 'SENT', 'RECEIVED', 'READ', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "diversityStatus" TEXT,
ADD COLUMN     "lastAuditDate" TIMESTAMP(3),
ADD COLUMN     "nextAuditDate" TIMESTAMP(3),
ADD COLUMN     "onboardingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "rating" REAL,
ADD COLUMN     "riskLevel" "RiskLevel",
ADD COLUMN     "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "SupplierContact" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierDocument" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierQualification" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "QualificationStatus" NOT NULL DEFAULT 'PENDING',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "attachments" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCommunication" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SupplierToSupplierCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SupplierToSupplierCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierContact_supplierId_email_key" ON "SupplierContact"("supplierId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierCategory_name_key" ON "SupplierCategory"("name");

-- CreateIndex
CREATE INDEX "_SupplierToSupplierCategory_B_index" ON "_SupplierToSupplierCategory"("B");

-- AddForeignKey
ALTER TABLE "SupplierContact" ADD CONSTRAINT "SupplierContact_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierDocument" ADD CONSTRAINT "SupplierDocument_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierQualification" ADD CONSTRAINT "SupplierQualification_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCommunication" ADD CONSTRAINT "SupplierCommunication_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupplierToSupplierCategory" ADD CONSTRAINT "_SupplierToSupplierCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupplierToSupplierCategory" ADD CONSTRAINT "_SupplierToSupplierCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SupplierCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
