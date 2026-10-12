-- AlterTable
ALTER TABLE "Order" ADD COLUMN "address" TEXT;
ALTER TABLE "Order" ADD COLUMN "city" TEXT;
ALTER TABLE "Order" ADD COLUMN "country" TEXT;
ALTER TABLE "Order" ADD COLUMN "phone" TEXT;
ALTER TABLE "Order" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingName" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "color" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "size" TEXT;
