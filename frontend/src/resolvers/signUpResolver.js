import { z } from "zod";
import { sanitizedZodResolver } from '../helpers/utils.js';

const signUpSchema = z.object({
  email: z.email("Incorrect email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Provided passwords do not match",
  path: ["confirmPassword"]
});

export const signUpResolver = sanitizedZodResolver(signUpSchema);