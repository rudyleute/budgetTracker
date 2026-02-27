import {CategoriesGet} from "./components/categories";
import { z } from "zod";
import {CounterpartiesGet} from "./components/counterparties";

export interface CustomError {
    message: string;
}

export const userUidField = z.string()
    .min(1, "Uid field must be of at least length 1")
    .max(128, "Uid field must be less than 128 characters");
export const createdAtField = z.coerce.date().refine(
    (date) => date <= new Date(),
    {message: "Created_at date cannot be in the future"}
);
export const updatedAtField = z.coerce.date().refine(
    (date) => date <= new Date(),
    {message: "Updated_at date cannot be in the future"}
).optional();

export type QueryParam = string | number | boolean;
export type EntityName = 'category' | 'counterparty';

export type TableName = 'categories' | 'users' | 'counterparties' | 'loans' | 'transactions';
export type TableIdField = 'id' | 'uid';

type GetArray = CategoriesGet | CounterpartiesGet;
export interface GetRes {
    data: GetArray,
    is_last_page?: boolean
}

export interface RequestQuery {
    filter?: string,
    offset?: number,
    limit?: number,
    balance?: boolean
}