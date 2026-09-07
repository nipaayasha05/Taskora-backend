-- CreateEnum
CREATE TYPE "OrganizationJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "organization_join_request" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedToId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'TEAM_MEMBER',
    "status" "OrganizationJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "organization_join_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_join_request_organizationId_invitedToId_idx" ON "organization_join_request"("organizationId", "invitedToId");

-- AddForeignKey
ALTER TABLE "organization_join_request" ADD CONSTRAINT "organization_join_request_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_join_request" ADD CONSTRAINT "organization_join_request_invitedToId_fkey" FOREIGN KEY ("invitedToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_join_request" ADD CONSTRAINT "organization_join_request_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_join_request" ADD CONSTRAINT "organization_join_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
