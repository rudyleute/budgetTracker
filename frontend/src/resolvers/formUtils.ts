import { sanitizedZodResolver } from '../helpers/utils.js';
import { ChangeEmailSchema } from "./changeEmailResolver";
import {z} from "zod";
import {Resolver} from "react-hook-form";
import {CategorySchema} from "./categoryResolver";
import {CounterpartySchema} from "./counterpartyResolver";
import {LoanSchema} from "./loanResolver";
import {LoginSchema} from "./loginResolver";
import {SignUpSchema} from "./signUpResolver";
import {TransactionSchema} from "./transactionResolver";

type AllowedSchemasClient = ChangeEmailSchema | CategorySchema | CounterpartySchema | LoanSchema | TransactionSchema | LoginSchema | SignUpSchema;
export type AllowedSchemasZodTypeClient = z.infer<AllowedSchemasClient>;
type FormUtils = <T extends AllowedSchemasClient>(schema: T) => {
    resolver: Resolver,
    fieldsMeta: Record<keyof T['shape'], { required: boolean }>
}

export const formUtils: FormUtils = <T extends AllowedSchemasClient>(schema: T) => {
    return {
        resolver: sanitizedZodResolver(schema),
        fieldsMeta: Object.keys(schema.shape).reduce((acc, name) => {
            const key = name as keyof T['shape'];
            acc[key] = { required: !(((schema.shape as z.ZodRawShape)[name] as z.ZodType) instanceof z.ZodOptional) };
            return acc;
        }, {} as Record<keyof T['shape'], { required: boolean }>)
    };
};