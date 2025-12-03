import { z } from 'zod';
import { sanitizedZodResolver } from '../helpers/utils.js';

const categorySchema = z.object({
  name: z.string().min(3, "Min 3 symbols are required").max(100, "Max 100 symbols are allowed"),
  color: z.string().regex(/^#[A-Fa-f0-9]{6}$/, "Invalid color (only hex format is supported)")
});

export const categoryResolver = sanitizedZodResolver(categorySchema);