import {CategoryGet} from "./components/categories";
import {z} from "zod";
import {CounterpartyGet} from "./components/counterparties";
import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {LoanGet} from "./components/loans";
import {UserGet} from "./components/users";
import {TransactionGet} from "./components/transactions";

export interface CustomError {
    message: string;
}

export const userUidField = z.string()
    .min(1, "Uid field must be of at least length 1")
    .max(128, "Uid field must be less than 128 characters"
);

export const createdAtField = z.coerce.date().refine(
    (date) => date <= new Date(),
    {message: "Created_at date cannot be in the future"}
);

export const updatedAtField = z.coerce.date().refine(
    (date) => date <= new Date(),
    {message: "Updated_at date cannot be in the future"}
).optional();

export type QueryParam = string | number | boolean;
export type EntityName = 'category' | 'counterparty' | 'loan' | 'user' | 'transaction';
export type TableName = 'categories' | 'users' | 'counterparties' | 'loans' | 'transactions';
export type TableIdField = 'id' | 'uid';

export type AllowedResponseType = CategoryGet | CounterpartyGet | LoanGet | UserGet | TransactionGet;
export interface GetRes<T extends AllowedResponseType> {
    data: T[],
    is_last_page?: boolean
}

export type SchemaFields<T extends z.ZodType<AllowedResponseType>> = (keyof T['_output'])[];

export const basicRequestQuerySchema = z.object({
    filter: z.string().optional(),
    offset: z.coerce.number().min(0, 'Offset must be positive').default(0),
    limit: z.coerce.number().optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('DESC').optional()
});

export type Schemas<
    TGet extends z.ZodType = z.ZodType,
    TPost extends z.ZodType = z.ZodType,
    TPatch extends z.ZodType = z.ZodType
> = {
    get: TGet;
    post: TPost;
    patch: TPatch;
};

export interface BaseConstructorParams {
    db: DB,
    logger: Logger,
    entityName: EntityName,
    tableName: TableName
}
export interface EntityConstructorParams<TGet extends z.ZodType<AllowedResponseType> = z.ZodType<AllowedResponseType>> extends BaseConstructorParams {
    schemas: Schemas<TGet>,
    getFields: SchemaFields<TGet>
}