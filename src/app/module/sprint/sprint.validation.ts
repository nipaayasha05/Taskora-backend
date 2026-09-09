import { z } from "zod";

export const sprintCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(100, "Sprint name cannot exceed 100 characters"),

  goal: z
    .string()
    .max(500, "Sprint goal cannot exceed 500 characters")
    .optional(),

  startDate: z.string().datetime({ message: "Invalid start date" }),

  endDate: z.string().datetime({ message: "Invalid end date" }),

  //   status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),

  paymentAmount: z.number().nonnegative("Payment amount cannot be negative"),
});

export const sprintUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(100, "Sprint name cannot exceed 100 characters")
    .optional(),

  goal: z
    .string()
    .max(500, "Sprint goal cannot exceed 500 characters")
    .optional(),

  startDate: z.string().datetime({ message: "Invalid start date" }).optional(),

  endDate: z.string().datetime({ message: "Invalid end date" }).optional(),

  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),

  paymentAmount: z
    .number()
    .nonnegative("Payment amount cannot be negative")
    .optional(),
});

export const sprintTeamCreateSchema = z.object({
  teamIds: z.array(z.string().uuid("Invalid teamId")),
});
