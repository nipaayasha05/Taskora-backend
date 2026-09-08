import { ProjectStatus } from "../../../../prisma/generated/prisma/enums";

export interface IProjectCreate {
  name: string;
  description?: string;
  //   status?: ProjectStatus;
  startDate?: Date;
  dueDate?: Date;
}

export interface IProjectTeamCreate {
  teamIds: string[];
}
