-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "oldPrice" REAL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "eventTag" TEXT,
    "sizes" TEXT NOT NULL DEFAULT 'S,M,L,XL',
    "colors" TEXT NOT NULL DEFAULT 'Black'
);
INSERT INTO "new_Product" ("ageGroup", "category", "collection", "createdAt", "description", "eventTag", "id", "image", "isBestSeller", "isNewArrival", "name", "oldPrice", "price", "stock") SELECT "ageGroup", "category", "collection", "createdAt", "description", "eventTag", "id", "image", "isBestSeller", "isNewArrival", "name", "oldPrice", "price", "stock" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
