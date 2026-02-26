import {CategoriesGet} from "./categories";
import { z } from "zod";

export interface CustomError {
    message: string;
}

export const uidSchema = z.string()
    .min(1, "Uid field must be of at least length 1")
    .max(128, "Uid field must be less than 128 characters");

export type QueryParam = string | number | boolean;
export type EntityName = 'category';

export type TableName = 'categories' | 'users' | 'counterparties' | 'loans' | 'transactions';
export type TableIdField = 'id' | 'uid';

type GetArray = CategoriesGet;
export interface GetRes {
    data: GetArray
}