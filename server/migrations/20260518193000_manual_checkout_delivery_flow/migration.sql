ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Order" ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "total" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "customerType" TEXT NOT NULL DEFAULT 'GUEST';
ALTER TABLE "Order" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN "guestPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN "cartFingerprint" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingTokenHash" TEXT;
ALTER TABLE "Order" ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "Order"
SET
  "subtotal" = COALESCE("subtotal", "amount"),
  "total" = COALESCE("total", "amount"),
  "customerType" = CASE WHEN "userId" IS NULL THEN 'GUEST' ELSE 'USER' END,
  "guestEmail" = CASE WHEN "userId" IS NULL THEN "customerEmail" ELSE NULL END,
  "guestPhone" = CASE WHEN "userId" IS NULL THEN "customerPhone" ELSE NULL END
WHERE "subtotal" = 0 AND "total" = 0;

ALTER TABLE "OrderItem" ADD COLUMN "productSnapshotImage" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "deliveryType" TEXT NOT NULL DEFAULT 'MIXED';
ALTER TABLE "OrderItem" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'LOCKED';

ALTER TABLE "Payment" ADD COLUMN "customerReference" TEXT;
ALTER TABLE "Payment" ADD COLUMN "proofFileUrl" TEXT;
ALTER TABLE "Payment" ADD COLUMN "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Payment" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "reviewedBy" TEXT;
ALTER TABLE "Payment" ADD COLUMN "rejectionReason" TEXT;

CREATE TABLE "Delivery" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "orderItemId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'LOCKED',
  "deliveryContentEncrypted" TEXT NOT NULL,
  "deliveryType" TEXT NOT NULL DEFAULT 'MIXED',
  "activationGuide" TEXT,
  "restrictions" TEXT,
  "region" TEXT,
  "sentAt" TIMESTAMP(3),
  "sentBy" TEXT,
  "viewedAt" TIMESTAMP(3),
  "resendCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderActionLog" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderActionLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE INDEX "Order_cartFingerprint_idx" ON "Order"("cartFingerprint");
CREATE INDEX "Order_guestEmail_guestPhone_createdAt_idx" ON "Order"("guestEmail", "guestPhone", "createdAt");
CREATE INDEX "Delivery_orderId_idx" ON "Delivery"("orderId");
CREATE INDEX "Delivery_orderItemId_idx" ON "Delivery"("orderItemId");
CREATE INDEX "OrderActionLog_orderId_createdAt_idx" ON "OrderActionLog"("orderId", "createdAt");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderActionLog" ADD CONSTRAINT "OrderActionLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
