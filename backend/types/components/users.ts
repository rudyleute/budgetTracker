import { z } from "zod";
import {userUidField} from "../basic";

export const usersGetSchema = z.object({
   uid: userUidField,
   created_at: z.coerce.date("createdAtField field must be a valid date")
}).strip();

export const usersPostSchema = usersGetSchema.omit({
   created_at: true
});

export type UserPost = z.infer<typeof usersPostSchema>;
export type UserGet = z.infer<typeof usersGetSchema>;