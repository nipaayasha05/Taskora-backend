import { ProjectStatus } from "../../../../prisma/generated/prisma/enums";

export interface IProjectCreate {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  dueDate?: Date;
  clientId:string
}

export interface IProjectTeamCreate {
  teamIds: string[];
}
