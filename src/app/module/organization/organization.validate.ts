import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name cannot exceed 100 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),

  industry: z
    .string()
    .min(2, "Industry is required")
    .max(100, "Industry cannot exceed 100 characters"),

  logo: z.string().url("Logo must be a valid URL").optional().nullable(),
});

export const organizationJoinSchema = z.object({
  invitedToId: z.string().uuid("Invalid invitedToId"),

  invitedById: z.string().uuid("Invalid invitedById"),
});

export const organizationJoinUpdateSchema = z.object({
  organizationId: z.string().uuid("Invalid organizationId"),

  invitedToId: z.string().uuid("Invalid invitedToId"),

  status: z.enum(["APPROVED", "REJECTED"]),
});

export const organizationMemberUpdateSchema = z.object({
  // organizationId: z.string().uuid("Invalid organizationId"),

  // memberId: z.string().uuid("Invalid memberId"),

  role: z.enum(["TEAM_MEMBER", "MANAGER"]),
});
