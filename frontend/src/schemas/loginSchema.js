import { z } from "zod";
import { sanitizedZodResolver } from '../helpers/utils.js';

const loginSchema = z.object({
  email: z.email("Incorrect email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginResolver = sanitizedZodResolver(loginSchema);