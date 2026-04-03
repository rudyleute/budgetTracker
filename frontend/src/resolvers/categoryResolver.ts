import { z } from 'zod';
import { formUtils } from './formUtils.js';

const categorySchema = () => {
    return z.object({
        name: z.string().min(3, "Min 3 symbols are required").max(100, "Max 100 symbols are allowed"),
        color: z.string().regex(/^#[A-Fa-f0-9]{6}$/, "Invalid color (only hex format is supported)")
    });
}

export const categoryFormUtils = () => formUtils(categorySchema());
export type CategorySchema = ReturnType<typeof categorySchema>;
export type CategorySchemaType = z.infer<CategorySchema>;