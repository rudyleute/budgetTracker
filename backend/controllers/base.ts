import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {
    ConstructorParams,
    CustomError,
    EntityName,
    QueryParam,
    AllowedResponseType,
    TableName
} from "../types/basic";
import {DeleteData, Options, QueryBuilder, QueryIdBuilder} from "../types/components";
import {isBody, isUser} from "../utils/general";
import {parseError} from "../utils/parsers";
import {z, ZodError} from "zod";
import express, {NextFunction, Request, Response, Router} from "express";
import {Schemas} from "../types/basic";

export abstract class BaseController<TGetSchema extends z.ZodType<AllowedResponseType>> {
    protected readonly db: DB;
    protected readonly logger: Logger;
    protected readonly entityName: EntityName;
    protected readonly tableName: TableName;
    protected readonly schemas: Schemas<TGetSchema>;
    protected readonly pageSize: number = 30;
    protected router: Router;

    protected constructor({db, logger, entityName, tableName, schemas}: ConstructorParams<TGetSchema>) {
        this.db = db;
        this.logger = logger;
        this.entityName = entityName;
        this.tableName = tableName;
        this.schemas = schemas;

        this.router = express.Router();
        this.router.use(this.requireUser);
        this.router.post('/', this.createEntity);
        this.router.patch('/:id', this.updateEntity);
        this.router.delete('/:id', this.deleteEntity);
    }

    protected createEntity = (req: Request, res: Response<z.infer<TGetSchema> | CustomError>) => this.handleUpsert({
        req,
        res,
        schema: this.schemas.post,
        responseSchema: this.schemas.get,
        entityName: this.entityName,
        buildQuery: this.buildPostQuery
    }, this.db, this.logger);

    protected updateEntity = (req: Request, res: Response<z.infer<TGetSchema> | CustomError>) => this.handleUpsert({
        req,
        res,
        entityName: this.entityName,
        schema: this.schemas.patch,
        responseSchema: this.schemas.get,
        buildQuery: this.buildPatchQuery
    }, this.db, this.logger);

    protected deleteEntity = (req: Request, res: Response<CustomError | void>) => this.handleDelete({
        table: this.tableName,
        idField: 'id',
        entityName: this.entityName,
        req,
        res
    }, this.db, this.logger);

    protected validateFields = <T extends z.ZodType>(
        body: Record<string, unknown>,
        schema: T,
    ) => {
        type AllowedFields = keyof z.infer<T>;
        let validatedBody: Record<AllowedFields, unknown>;

        try {
            validatedBody = schema.parse(body) as Record<AllowedFields, unknown>;
        } catch (e: unknown) {
            if (e instanceof ZodError) return {error: JSON.stringify(e.issues)};
            return {error: 'Unexpected error occurred'};
        }

        const fields: AllowedFields[] = [];
        const values: QueryParam[] = [];

        for (const [field, value] of Object.entries(validatedBody)) {
            if (value !== undefined) {
                fields.push(field as AllowedFields);
                values.push(value as QueryParam);
            }
        }

        return {fields, values};
    };

    protected handleUpsert = async <T extends z.ZodType>(
        options: Options<T, TGetSchema>,
        db: DB,
        logger: Logger
    ) => {
        const {
            req,
            res,
            entityName,
            schema,
            responseSchema,
            additionalValidation,
            buildQuery
        } = options;
        const uid = req.user!.uid;
        const id = req.params.id as string;
        const isUpdate = !!id; //id is undefined for post
        const operation = isUpdate ? 'update' : 'create';

        if (!isBody(req.body)) {
            logger.warn(`${this.entityName} ${operation} attempted with missing or invalid body`, {uid});
            res.status(400).json({message: "Request body is required"});
            return;
        }

        try {
            if (additionalValidation) {
                const validationError = await additionalValidation(db, req, uid);
                if (validationError) {
                    logger.warn(`${entityName} ${operation} failed validation`, {
                        uid,
                        [`${entityName}Id`]: id,
                        ...validationError.context
                    });
                    res.status(400).json({message: validationError.message});
                    return;
                }
            }

            const {fields, values, error} = this.validateFields(req.body, schema);

            if (error) {
                logger.warn(error, {uid, [`${entityName}Id`]: id});
                res.status(400).json({message: error});
                return;
            }

            logger.info(`${isUpdate ? 'Updating' : 'Creating'} ${entityName}`, {
                uid,
                [`${entityName}Id`]: id,
                body: req.body
            });

            const {query, queryValues} = buildQuery({fields: fields as string[], values: values as QueryParam[], uid, id});
            const result = await db.query(query, queryValues);

            if (result.rows.length === 0 && isUpdate) {
                logger.warn(`${entityName} not found for update`, {
                    uid,
                    [`${entityName}Id`]: id
                });
                res.status(404).json({message: `${entityName} not found`});
                return;
            }

            const elem = responseSchema.parse(result.rows[0]);
            logger.info(`${entityName} ${operation}d successfully`, {
                uid,
                [`${entityName}Id`]: id
            });

            res.status(isUpdate ? 200 : 201).json(elem);
            return;
        } catch (error: unknown) {
            res.status(500).json(parseError(error, uid, entityName, operation));
        }
    };

    protected handleDelete = async (data: DeleteData, db: DB, logger: Logger) => {
        const {table, idField, entityName, res, req} = data;
        const uid = req.user!.uid;
        const id = req.params.id as string;

        const info = {uid, [`${entityName}Id`]: id};
        try {
            logger.info(`Attempting to delete ${entityName}`, {uid, [`${entityName}Id`]: id});

            const query = `
            DELETE
            FROM ${table}
            WHERE user_uid = $1
              AND ${idField} = $2
            RETURNING *;
        `;
            const result = await db.query(query, [uid, id]);

            if (result.rows.length === 0) {
                logger.warn(`${entityName} not found for deletion`, info);
                res.status(404).json({message: `The ${entityName} has not been found`});
                return;
            }

            logger.info(`${entityName} deleted successfully`, info);
            res.status(204).send();
        } catch (error: unknown) {
            res.status(500).json(parseError(error, uid, entityName, 'delete', info));
        }
    };

    protected requireUser = (req: Request, res: Response, next: NextFunction) => {
        if (!isUser(req, res)) return;
        next();
    };

    public getRouters = (): Router => this.router;
    protected abstract buildPostQuery: QueryBuilder;
    protected abstract buildPatchQuery: QueryIdBuilder;
}