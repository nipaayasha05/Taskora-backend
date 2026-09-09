import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title cannot exceed 200 characters"),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

  sprintTeamId: z.string().uuid("Invalid sprint team ID"),

  dueDate: z.string().datetime({ message: "Invalid due date" }).optional(),
});

export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title cannot exceed 200 characters")
    .optional(),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

  sprintTeamId: z.string().uuid("Invalid sprint team ID").optional(),

  dueDate: z.string().datetime({ message: "Invalid due date" }).optional(),
});
