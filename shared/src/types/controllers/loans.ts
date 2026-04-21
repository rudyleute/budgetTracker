import {z} from "zod";
import {counterpartiesGetSchema} from "./counterparties";
import {createdAtField, updatedAtField, userUidField} from "../basic";

export enum LoanTypes {
    'borrowed' = 'borrowed',
    'lent' = 'lent',
}

export enum PriorityTypes {
    'low' = 'low',
    'medium' = 'medium',
    'high' = 'high'
}

const loansSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3, 'The loan\'s name length must be of length 3 at least').max(100, 'The loan\'s name length can\'t be bigger than 100'),
    timestamp: z.coerce.date(),
    deadline: z.coerce.date().nullish(),
    type: z.enum(LoanTypes),
    priority: z.enum(PriorityTypes).nullish(),
    sum: z.coerce.number().min(0, 'The sum must be bigger than 0'),
    counterparty_id: z.uuid(),
    closed_at: z.coerce.date().refine(
        (date) => date <= new Date(),
        {message: "Closed_at date cannot be in the future"}
    ).nullish(),
    created_at: createdAtField,
    updated_at: updatedAtField,
    user_uid: userUidField,
    is_due: z.boolean()
});

const loansCounterpartySchema = counterpartiesGetSchema.omit({
    created_at: true,
    updated_at: true,
    balance: true
});

export const loansUserlessSchema = loansSchema.omit({ user_uid: true });

export const loansGetSchema = loansUserlessSchema.omit({
    counterparty_id: true
}).extend({
    counterparty: loansCounterpartySchema
});

export const loansWriteSchema = loansUserlessSchema.omit({
    created_at: true,
    id: true,
    updated_at: true,
});

export const loansPostSchema = loansWriteSchema;
export const loansPatchSchema = loansWriteSchema.partial().refine(
    (data) => Object.values(data).some(value => value !== undefined),
    {message: "At least one field must be provided for update"}
);

export type LoanGetServer = z.infer<typeof loansGetSchema>;
export type LoanGetSchema = typeof loansGetSchema;
export type LoansGetServer = LoanGetServer[];
export type LoanPostServer = z.infer<typeof loansPostSchema>;
export type LoanPatchServer = z.infer<typeof loansPatchSchema>;