import { z } from "zod";
import {uidSchema} from "./basic";

export const usersGetSchema = z.object({
   uid: uidSchema,
   created_at: z.coerce.date("createdAt field must be a valid date")
}).strip();

export const usersPostSchema = usersGetSchema.omit({
   created_at: true
});

export type UserPost = z.infer<typeof usersPostSchema>;
export type UserGet = z.infer<typeof usersGetSchema>;