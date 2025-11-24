import { z } from 'zod';
import { sanitizedZodResolver } from '../helpers/transformers.jsx';

const transactionSchema = z.object({
  name: z.string().min(3, "Min 3 symbols are required").max(255, "Max 255 symbols are allowed").trim(),
  price: z.coerce.number().positive("Price must be positive").min(0.01, "Price must be at least 0.01"),
  timestamp: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid timestamp format")
    .refine((value) => !isNaN(Date.parse(value)), { message: "Invalid date" })
    .transform((value) => new Date(value))
    .refine((date) => date <= new Date(), {
      message: "Timestamp cannot be in the future"
    }),
  categoryId: z.uuid("Category cannot be empty")
});

export const transactionResolver = sanitizedZodResolver(transactionSchema)