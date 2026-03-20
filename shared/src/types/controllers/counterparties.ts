import {z} from "zod";
import {createdAtField, updatedAtField, userUidField} from "../basic";

const counterpartiesSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3, 'The counterparty\'s name length must be of length 3 at least').max(100, 'The counterparty\'s name length can\'t be bigger than 100'),
    email: z.email('Incorrect email format').min(5, 'Email can\'t be shorter than 5 characters').max(255, 'Email can\'t be longer than 256 characters').nullish(),
    phone: z.string().max(15, 'Phone numbers can\'t be longer than 15 characters').regex(/^[1-9][0-9]{6,14}$/, "Incorrect phone format - no symbols are allowed apart from numbers").nullish(),
    note: z.string().max(200, 'Note\'s length can\'t be bigger than 200 characters').nullish(),
    created_at: createdAtField,
    updated_at: updatedAtField,
    user_uid: userUidField
});

const counterpartiesUserlessSchema = counterpartiesSchema.omit({
    user_uid: true
});

export const counterpartiesGetSchema = counterpartiesUserlessSchema.extend({
    balance: z.coerce.number()
});

const counterpartiesWriteSchema = counterpartiesUserlessSchema.omit({
    created_at: true,
    id: true,
    updated_at: true
});

export const counterpartiesPostSchema = counterpartiesWriteSchema;
export const counterpartiesPatchSchema = counterpartiesWriteSchema.partial().refine(
    (data) => Object.values(data).some(value => value !== undefined),
    { message: "At least one field must be provided for update" }
);

export type CounterpartyGetServer = z.infer<typeof counterpartiesGetSchema>;
export type CounterpartyGetSchema = typeof counterpartiesGetSchema;
export type CounterpartiesGetServer = CounterpartyGetServer[];
export type CounterpartyPostServer = z.infer<typeof counterpartiesPostSchema>;
export type CounterpartyPatchServer = z.infer<typeof counterpartiesPatchSchema>;