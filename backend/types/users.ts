import { z } from "zod";

export const usersPostSchema = z.object({
   uid: z.string().min(1, "Uid field must be of at least length 1").max(128, "Uid field must be less than 128 characters"),
   created_at: z.coerce.date("createdAt field must be a valid date").optional()
}).strip();

export const usersGetSchema = z.object({
   uid: z.string().min(1, "Uid field must be of at least length 1").max(128, "Uid field must be less than 128 characters"),
   created_at: z.coerce.date("createdAt field must be a valid date")
}).strip();

export type UserPost = z.infer<typeof usersPostSchema>;
export type UserGet = z.infer<typeof usersGetSchema>;