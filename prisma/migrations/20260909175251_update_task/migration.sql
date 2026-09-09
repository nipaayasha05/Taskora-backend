/*
  Warnings:

  - You are about to drop the column `teamId` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `sprintTeamId` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_teamId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "teamId",
ADD COLUMN     "sprintTeamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_sprintTeamId_fkey" FOREIGN KEY ("sprintTeamId") REFERENCES "sprint_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
