import {DB} from "../utils/db";
import {Request, Response} from "express";
import {CustomError, EntityName, QueryParam, TableIdField, TableName} from "./basic";
import {z} from "zod";

export interface BuildQueryParams {
    fields: readonly string[];
    values: QueryParam[];
    uid: string;
}

export interface BuildQueryIdParams extends BuildQueryParams {
    id: string;
}

export interface BuildQueryResult {
    query: string;
    queryValues: QueryParam[];
}

export interface ValidationError {
    message: string;
    context?: object
}

export type Validator = (db: DB, req: Request, uid: string) => Promise<ValidationError | null>;
export type QueryBuilder = (params: BuildQueryParams) => BuildQueryResult;
export type QueryIdBuilder = (params: BuildQueryIdParams) => BuildQueryResult;
export type QueryBuilders = QueryBuilder | QueryIdBuilder;

export interface Options<T extends z.ZodType, TR extends z.ZodType> {
    req: Request;
    res: Response<z.infer<TR> | CustomError>;
    entityName: EntityName;
    schema: T;
    responseSchema: TR;
    buildQuery: QueryBuilders;
    additionalValidation?: Validator;
}

export interface DeleteData {
    table: TableName,
    idField: TableIdField,
    entityName: EntityName,
    req: Request,
    res: Response<CustomError | void>
}