/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "projects_name_organizationId_key" ON "projects"("name", "organizationId");
