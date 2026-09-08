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

export interface IOrganizationJoin {
  // organizationId: string;
  invitedToId: string;
  invitedById: string;
}

export interface IOrganizationJoinUpdate {
  organizationId: string;
  invitedToId: string;
  status: "APPROVED" | "REJECTED";
}

export interface IOrganizationMemberUpdate {
  organizationId: string;
  memberId: string;
  role: "TEAM_MEMBER" | "MANAGER";
}
