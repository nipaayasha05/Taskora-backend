import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").trim(),

  description: z.string().optional(),

  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),

  startDate: z.coerce.date().optional(),

  dueDate: z.coerce.date().optional(),
  clientId: z.string().uuid("Invalid clientId"),
});

export const projectTeamCreateSchema = z.object({
  teamIds: z
    .array(z.string().uuid("Invalid teamId"))
    .min(1, "At least one team is required"),
});
