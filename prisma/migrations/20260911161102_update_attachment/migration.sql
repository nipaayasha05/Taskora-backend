/*
  Warnings:

  - You are about to drop the column `fileSize` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `attachments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "fileSize",
DROP COLUMN "fileType",
DROP COLUMN "publicId";
