import {z} from "zod";
import {createdAtField, userUidField, updatedAtField} from "../basic";

const counterpartiesSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3, 'The counterparty\'s name length must be of length 3 at least').max(100, 'The counterparty\'s name length can\'t be bigger than 100'),
    email: z.email('Incorrect email format').min(5, 'Email can\'t be shorter than 5 characters').max(255, 'Email can\'t be longer than 256 characters').optional(),
    phone: z.string().max(15, 'Phone numbers can\'t be longer than 15 characters').regex(/^[1-9][0-9]{6,14}$/, "Incorrect phone format - no symbols are allowed apart from numbers").optional(),
    note: z.string().max(200, 'Note\'s length can\'t be bigger than 200 characters').optional(),
    created_at: createdAtField,
    updated_at: updatedAtField,
    user_uid: userUidField
});

export const counterpartiesGetSchema = counterpartiesSchema.omit({
    user_uid: true
});

export const counterpartiesPostSchema = counterpartiesGetSchema.omit({
    created_at: true,
    id: true,
    updated_at: true
});

export const counterpartiesPatchSchema = counterpartiesGetSchema.omit({
    created_at: true,
    id: true
}).partial().refine(
    (data) => Object.values(data).some(value => value !== undefined),
    { message: "At least one field must be provided for update" }
);

export type CounterpartyGet = z.infer<typeof counterpartiesGetSchema>;
export type CounterpartiesGet = CounterpartyGet[];