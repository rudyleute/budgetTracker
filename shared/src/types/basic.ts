import {CategoryGet} from "./controllers/categories";
import {CounterpartyGet} from "./controllers/counterparties";
import {LoanGet} from "./controllers/loans";
import {UserGet} from "./controllers/users";
import {TransactionGet} from "./controllers/transactions";
import {z} from "zod";

export interface CustomError {
    message: string;
}

export type AllowedResponseType = CategoryGet | CounterpartyGet | LoanGet | UserGet | TransactionGet;
export interface GetRes<T extends AllowedResponseType> {
    data: T[],
    is_last_page?: boolean
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