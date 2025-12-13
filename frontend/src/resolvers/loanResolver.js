import { z } from 'zod';
import { sanitizedZodResolver } from '../helpers/utils.js';

const loanSchema = (typeValues, priorityValues) => {
  return z.object({
    name: z.string().min(3, "Min 3 symbols are required").max(255, "Max 255 symbols are allowed").trim(),
    sum: z.coerce.number().positive("Sum must be positive").min(0.01, "Sum must be at least 0.01"),
    timestamp: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid timestamp format")
      .refine((value) => !isNaN(Date.parse(value)), { message: "Invalid date" })
      .transform((value) => new Date(value))
      .refine((date) => date <= new Date(), {
        message: "Timestamp cannot be in the future"
      }),
    deadline: z.string().optional()
      .refine(
        (val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
        { message: "Invalid deadline format" }
      )
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        { message: "Invalid date" }
      ),
    type: z.enum(typeValues),
    priority: z.enum(priorityValues).optional(),
    counterpartyId: z.uuid("Counterparty cannot be empty")
  });
}

export const loanFormUtils = (typeValues, priorityValues) => {
  const schema = loanSchema(typeValues, priorityValues);
  return {
    resolver: sanitizedZodResolver(schema),
    fieldsMeta: Object.keys(schema.shape).reduce((acc, name) => {
      acc[name] = {required: !schema.shape[name].isOptional()};
      return acc;
    }, {})
  };
};