CREATE TABLE "SiteVisit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "listingId" TEXT,
    "categoryId" TEXT,
    "userId" TEXT,
    "visitorId" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteVisit_createdAt_idx" ON "SiteVisit"("createdAt");
CREATE INDEX "SiteVisit_pageType_idx" ON "SiteVisit"("pageType");
CREATE INDEX "SiteVisit_listingId_idx" ON "SiteVisit"("listingId");
CREATE INDEX "SiteVisit_categoryId_idx" ON "SiteVisit"("categoryId");
CREATE INDEX "SiteVisit_visitorId_idx" ON "SiteVisit"("visitorId");
