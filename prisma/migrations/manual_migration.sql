-- Step 1: Create the new tables
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

-- Step 2: Add unique constraint
CREATE UNIQUE INDEX "SupplierItem_supplierId_itemCatalogId_key" ON "SupplierItem"("supplierId", "itemCatalogId");

-- Step 3: Migrate data from Item to ItemCatalog
INSERT INTO "ItemCatalog" (
    "id",
    "name",
    "description",
    "dimensions",
    "weight",
    "storageConditions",
    "handlingInstructions",
    "minimumStockLevel",
    "reorderPoint",
    "categoryId",
    "status",
    "userId",
    "createdAt",
    "updatedAt"
)
SELECT 
    id,
    name,
    description,
    dimensions,
    weight,
    "storageConditions",
    "handlingInstructions",
    "minimumStockLevel",
    "reorderPoint",
    "categoryId",
    status,
    "userId",
    "createdAt",
    "updatedAt"
FROM "Item";

-- Step 4: Create SupplierItem entries for existing relationships
INSERT INTO "SupplierItem" (
    "id",
    "supplierId",
    "itemCatalogId",
    "unitPrice",
    "createdAt",
    "updatedAt"
)
SELECT 
    CONCAT(i."supplierId", '_', i.id) as id,
    i."supplierId",
    i.id as "itemCatalogId",
    i."purchasePrice" as "unitPrice",
    i."createdAt",
    i."updatedAt"
FROM "Item" i;

-- Step 5: Add foreign key constraints
ALTER TABLE "ItemCatalog" ADD CONSTRAINT "ItemCatalog_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ItemCatalog" ADD CONSTRAINT "ItemCatalog_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_supplierId_fkey" 
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_itemCatalogId_fkey" 
    FOREIGN KEY ("itemCatalogId") REFERENCES "ItemCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Update Item table to reference ItemCatalog
ALTER TABLE "Item" ADD COLUMN "itemCatalogId" TEXT;
UPDATE "Item" SET "itemCatalogId" = id;
ALTER TABLE "Item" ALTER COLUMN "itemCatalogId" SET NOT NULL;
ALTER TABLE "Item" ADD CONSTRAINT "Item_itemCatalogId_fkey" 
    FOREIGN KEY ("itemCatalogId") REFERENCES "ItemCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 