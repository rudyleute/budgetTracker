import {DB} from "../utils/db";
import {Request, Response} from "express";
import {z} from "zod";
import {AllowedResponseType, CustomError} from "@app/shared";
import {Logger} from "../utils/logger";

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

export interface Options<T extends z.ZodType, TR extends z.ZodType<AllowedResponseType>> {
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

export type QueryParam = string | number | boolean;
export type EntityName = 'category' | 'counterparty' | 'loan' | 'user' | 'transaction';
export type TableName = 'categories' | 'users' | 'counterparties' | 'loans' | 'transactions';
export type TableIdField = 'id' | 'uid';

export type SchemaFields<T extends z.ZodType<AllowedResponseType>> = (keyof T['_output'])[];

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