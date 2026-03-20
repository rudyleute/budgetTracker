import { z } from "zod";
import {userUidField} from "../basic";

export const usersGetSchema = z.object({
   uid: userUidField,
   created_at: z.coerce.date("createdAtField field must be a valid date")
}).strip();

export const usersPostSchema = usersGetSchema.omit({
   created_at: true
});

export type UserGetSchema = typeof usersGetSchema;
export type UserGetServer = z.infer<typeof usersGetSchema>;
export type UserPostServer = z.infer<typeof usersPostSchema>;