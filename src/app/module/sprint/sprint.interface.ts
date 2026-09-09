import { SprintStatus } from "../../../../prisma/generated/prisma/enums";

export interface ISprintCreate {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  //   status?: SprintStatus;
  paymentAmount: number;
}

export interface ISprintTeamCreate {
  teamIds: string[];
}
