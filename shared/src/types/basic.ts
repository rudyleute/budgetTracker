import {CategoryGetServer} from "./controllers/categories";
import {CounterpartyGetServer} from "./controllers/counterparties";
import {LoanGetServer} from "./controllers/loans";
import {UserGetServer} from "./controllers/users";
import {TransactionGetServer} from "./controllers/transactions";
import {z} from "zod";

export interface CustomError {
    message: string;
}

export type AllowedPagResServer = CounterpartyGetServer | LoanGetServer | TransactionGetServer;
export type AllowedNPagResServer = CategoryGetServer;
export type AllowedResServer = AllowedPagResServer | AllowedNPagResServer | UserGetServer;

interface GetResServer<T extends AllowedResServer> {
    data: T[]
}
export interface GetNPagResServer<T extends AllowedNPagResServer> extends GetResServer<T> {
    data: T[]
}

export interface GetPagResServer<T extends AllowedPagResServer> extends GetResServer<T> {
    is_last_page: boolean
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


export type AllowedField<T extends z.ZodType> = keyof z.infer<T>;