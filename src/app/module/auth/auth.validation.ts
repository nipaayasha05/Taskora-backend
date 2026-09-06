import z from "zod";

const userRegistrationZodSchema = z.object({
  name: z
    .string("name is required")
    .min(3, "name must be at least 3 characters long")
    .max(12, "name must be at most 12 characters long"),
  email: z.email(),
  password: z
    .string("password is required")
    .min(6, "password must be at least 6 characters long")
    .regex(/[A-Z]/, "password must contain at least one uppercase letter")
    .regex(/[a-z]/, "password must contain at least one lowercase letter")
    .regex(/[0-9]/, "password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "password must contain at least one special character",
    ),
});

const PatientEmailVerifyZodSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

const loginZodSchema = z.object({
  email: z.email(),
  password: z
    .string("password is required")
    .min(6, "password must be at least 6 characters long")
    .regex(/[A-Z]/, "password must contain at least one uppercase letter")
    .regex(/[a-z]/, "password must contain at least one lowercase letter")
    .regex(/[0-9]/, "password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "password must contain at least one special character",
    ),
});

const googleLoginZodSchema = z.object({
  idToken: z.string("idToken is required"),
});

export const userValidation = {
  userRegistrationZodSchema,
  PatientEmailVerifyZodSchema,
  loginZodSchema,
  googleLoginZodSchema,
};
