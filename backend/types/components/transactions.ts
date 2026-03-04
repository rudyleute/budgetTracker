import {z} from "zod";
import {createdAtField, userUidField, updatedAtField, basicRequestQuerySchema} from "../basic";

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
    category_id: z.uuid().optional()
});

export const transactionsGetSchema = transactionsSchema.omit({
    user_uid: true
});

export const transactionsPostSchema = transactionsGetSchema.omit({
    created_at: true,
    id: true,
    updated_at: true
});

export const transactionsPatchSchema = transactionsGetSchema.omit({
    created_at: true,
    id: true
}).partial().refine(
    (data) => Object.values(data).some(value => value !== undefined),
    { message: "At least one field must be provided for update" }
);

export type TransactionGet = z.infer<typeof transactionsGetSchema>;
export type TransactionGetSchema = typeof transactionsGetSchema;
export type TransactionsGet = TransactionGet[];

export const transactionsRequestQuerySchema = basicRequestQuerySchema.extend({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
}).omit({
    order: true,
}).transform(data =>
    Object.fromEntries(
        Object.entries(data)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    ) as Record<string, string>
);
export type TransactionsRequestQuery = z.infer<typeof transactionsRequestQuerySchema>;