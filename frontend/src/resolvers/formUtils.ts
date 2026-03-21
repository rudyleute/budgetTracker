import { sanitizedZodResolver } from '../helpers/utils.js';
import { ChangeEmailSchema } from "./changeEmailResolver";
import {z} from "zod";
import {Resolver} from "react-hook-form";

export type AllowedSchemasClient = z.infer<ChangeEmailSchema>;
type FormUtils = <T extends ChangeEmailSchema>(schema: T) => {
    resolver: Resolver,
    fieldsMeta: Record<keyof typeof schema.shape, { required: boolean }>
}

export const formUtils: FormUtils = <T extends ChangeEmailSchema>(schema: T) => {
    return {
        resolver: sanitizedZodResolver(schema),
        fieldsMeta: Object.keys(schema.shape).reduce((acc, name) => {
            const key = name as keyof typeof schema.shape;
            acc[key] = {required: !(schema.shape[key] instanceof z.ZodOptional)};
            return acc;
        }, {} as Record<keyof typeof schema.shape, { required: boolean }>)
    };
};