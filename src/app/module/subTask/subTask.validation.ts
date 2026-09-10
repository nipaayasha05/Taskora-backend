import { z } from "zod";

export const subTaskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

  assignedToId: z.string().uuid().optional(),

  dueDate: z.coerce.date().optional(),
});
