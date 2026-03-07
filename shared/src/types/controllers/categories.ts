import {z} from "zod";
import {createdAtField, updatedAtField, userUidField} from "../basic";

const categoriesSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3, 'The category\'s name length must be of length 3 at least').max(100, 'The category\'s name length can\'t be bigger than 100'),
    color: z.string().length(7, 'A full-code version of the hex must be provided').regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)"),
    created_at: createdAtField,
    updated_at: updatedAtField,
    user_uid: userUidField
});

export const categoriesGetSchema = categoriesSchema.omit({
    user_uid: true
});

const categoriesWriteSchema = categoriesGetSchema.omit({
    created_at: true,
    id: true,
    updated_at: true
});

export const categoriesPostSchema = categoriesWriteSchema;
export const categoriesPatchSchema = categoriesWriteSchema.partial().refine(
    (data) => Object.values(data).some(value => value !== undefined),
    {message: "At least one field must be provided for update"}
);

export type CategoryGet = z.infer<typeof categoriesGetSchema>;
export type CategoryGetSchema = typeof categoriesGetSchema;
export type CategoriesGet = CategoryGet[];