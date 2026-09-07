/*
  Warnings:

  - You are about to drop the column `userId` on the `organization_join_request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization_join_request" DROP CONSTRAINT "organization_join_request_userId_fkey";

-- AlterTable
ALTER TABLE "organization_join_request" DROP COLUMN "userId";
