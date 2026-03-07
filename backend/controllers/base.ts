import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {z} from "zod";
import express, {Request, Response, Router} from "express";
import {AllowedResponseType, CustomError} from "@app/shared";
import {BaseConstructorParams, EntityName, TableName} from "../types/controllers";

export abstract class BaseController<TGetSchema extends z.ZodType<AllowedResponseType>> {
    protected readonly db: DB;
    protected readonly logger: Logger;
    protected readonly entityName: EntityName;
    protected readonly tableName: TableName;
    protected router: Router;

    protected constructor({db, logger, entityName, tableName}: BaseConstructorParams) {
        this.db = db;
        this.logger = logger;
        this.entityName = entityName;
        this.tableName = tableName;

        this.router = express.Router();
    }

    protected abstract createEntity (req: Request, res: Response<z.infer<TGetSchema> | CustomError>): Promise<void>;
    protected abstract deleteEntity (req: Request, res: Response<CustomError | void>): Promise<void>;

    public getRouters = (): Router => this.router;
}