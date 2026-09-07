import { OrganizationStatus } from "../../../../prisma/generated/prisma/enums";

export interface IOrganizationCreate {
  name: string;
  description: string;
  industry: string;
  logo?: string;
}

export interface IOrganizationUpdate {
  status?: "APPROVED" | "REJECTED" | "DELETED";
}
