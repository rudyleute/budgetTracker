import { z } from 'zod';
import { formUtils } from './formUtils.js';

const counterpartySchema = () => {
    return z.object({
        name: z.string().min(3, "Min 3 symbols are required").max(255, "Max 255 symbols are allowed").trim(),
        email: z
            .email("Incorrect email format")
            .or(z.literal(""))
            .transform(val => val === "" ? undefined : val)
            .optional(),
        phone: z.string()
            .transform(val => val === "" ? undefined : val)
            .optional()
            .refine(
                (val) => !val || /^[1-9][0-9]{6,14}$/.test(val),
                { message: "Only digits without spaces or any other symbols are allowed" }
            ),
        note: z.string()
            .max(200, "Max 200 symbols are allowed")
            .transform(val => val === "" ? undefined : val)
            .optional()
    });
}

export const counterpartyFormUtils = () => formUtils(counterpartySchema());
export type CounterpartySchema = ReturnType<typeof counterpartySchema>;