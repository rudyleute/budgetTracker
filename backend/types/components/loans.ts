import {z} from "zod";
import {basicRequestQuerySchema, createdAtField, updatedAtField, userUidField} from "../basic";
import {counterpartiesGetSchema} from "./counterparties";

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
    user_uid: userUidField
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

export type LoanGet = z.infer<typeof loansGetSchema>;
export type LoanGetSchema = typeof loansGetSchema;
export type LoansGet = LoanGet[];

const SORTABLE = ['timestamp', 'deadline', 'name', 'priority', 'type'] as const satisfies readonly (keyof z.infer<typeof loansGetSchema>)[];
export type Sortable = typeof SORTABLE[number];
export const loansRequestQuerySchema = basicRequestQuerySchema.extend({
    type: z.enum(LoanTypes).optional(),
    priority: z.enum(PriorityTypes).optional(),
    sort: z.enum(SORTABLE).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    due: z.coerce.boolean().optional(),
    counterparty: z.uuid().optional()
}).omit({
    filter: true,
}).transform(data =>
    Object.fromEntries(
        Object.entries(data)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    ) as Record<string, string>
);
export type LoansRequestQuery = z.infer<typeof loansRequestQuerySchema>;