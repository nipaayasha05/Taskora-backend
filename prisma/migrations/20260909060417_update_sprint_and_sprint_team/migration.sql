/*
  Warnings:

  - Added the required column `createdById` to the `sprint_teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `sprints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sprint_teams" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sprints" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_teams" ADD CONSTRAINT "sprint_teams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
