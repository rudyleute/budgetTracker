import {z} from "zod";
import {loansGetSchema, LoanTypes, PriorityTypes} from "./controllers/loans";

export const basicRequestQuerySchema = z.object({
    filter: z.string().optional(),
    offset: z.coerce.number().min(0, 'Offset must be positive').default(0),
    limit: z.coerce.number().optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('DESC').optional()
});

export const transactionsRequestQuerySchema = basicRequestQuerySchema.extend({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
}).omit({
    order: true,
}).refine(({from, to}) => {
    if (from && to) return from <= to;
    return true;
}, {message: "from must be before to", path: ["from"]}).transform(data =>
    Object.fromEntries(
        Object.entries(data)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, v instanceof Date ? v.toISOString() : String(v)])
    ) as Record<string, string>
);
export type TransactionsRequestQuery = z.infer<typeof transactionsRequestQuerySchema>;


export const SORTABLE = loansGetSchema.pick({
    timestamp: true,
    deadline: true,
    name: true,
    priority: true,
    type: true,
    sum: true
}).keyof().options;
export type LoanSortableKey = typeof SORTABLE[number];

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

export const counterpartiesRequestQuerySchema = basicRequestQuerySchema.omit({order: true});
export type CounterpartiesRequestQuery = z.infer<typeof counterpartiesRequestQuerySchema>;