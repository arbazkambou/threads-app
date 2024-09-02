import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z
    .string()
    .min(3, { message: "Minimum three characters are required" })
    .max(1000),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z
    .string()
    .min(3, { message: "Minimum three characters are required" })
    .max(1000),
});
