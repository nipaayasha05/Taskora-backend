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
