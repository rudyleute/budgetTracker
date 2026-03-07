import {z} from "zod";
import {categoriesGetSchema} from "./categories";
import {createdAtField, updatedAtField, userUidField} from "../basic";

const transactionsSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3, 'The transaction\'s name length must be of length 3 at least').max(100, 'The transaction\'s name length can\'t be bigger than 100'),
    price: z.coerce.number().min(0, 'Price has to be not lower than 0'),
    timestamp: z.coerce.date().refine(
        (date) => date <= new Date(),
        {message: "Timestamp cannot be in the future"}
    ),
    created_at: createdAtField,
    updated_at: updatedAtField,
    user_uid: userUidField,
    category_id: z.uuid().nullish()
});

export const transactionsCategorySchema = categoriesGetSchema.omit({
    created_at: true,
    updated_at: true
});

const transactionsUserlessSchema = transactionsSchema.omit({user_uid: true});
export const transactionsGetSchema = transactionsUserlessSchema.omit({
    category_id: true
}).extend({
    category: transactionsCategorySchema.nullish()
});

const transactionsWriteSchema = transactionsUserlessSchema.pick({
    name: true,
    price: true,
    timestamp: true,
    category_id: true
});

export const transactionsPostSchema = transactionsWriteSchema;
export const transactionsPatchSchema = transactionsWriteSchema
    .partial()
    .refine(
        (data) => Object.values(data).some(value => value !== undefined),
        { message: "At least one field must be provided for update" }
    );


export type TransactionGet = z.infer<typeof transactionsGetSchema>;
export type TransactionGetSchema = typeof transactionsGetSchema;
export type TransactionsGet = TransactionGet[];