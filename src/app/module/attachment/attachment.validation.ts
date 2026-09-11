import z from "zod";

export const attachmentCreateSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
});
