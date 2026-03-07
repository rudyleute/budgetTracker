import {
    categoriesGetSchema,
    categoriesPatchSchema,
    categoriesPostSchema, CategoryGet,
    CategoryGetSchema, CustomError, GetRes,
    processCategories
} from "@app/shared";
import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {Request, Response} from "express";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder} from "../types/controllers";
import {EntityController} from "./entity";

export class CategoriesController extends EntityController<CategoryGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'category',
            tableName: 'categories',
            schemas: {
                get: categoriesGetSchema,
                post: categoriesPostSchema,
                patch: categoriesPatchSchema
            },
            getFields: categoriesGetSchema.keyof().options
        });

        this.router.get('/', this.getCategories);
    }

    private getCategories = async (req: Request, res: Response<GetRes<CategoryGet> | CustomError>) => {
        const uid = req.user!.uid;

        try {
            this.logger.debug('Fetching categories', {uid});

            const result = await this.db.query(
                `SELECT ${this.getQueryFields(this.tableName)} FROM categories WHERE user_uid = $1;`,
                [uid]
            );

            this.logger.info('Categories retrieved successfully', {
                uid,
                count: result.rows.length
            });

            res.status(200).json({data: processCategories(result.rows)});
        } catch (error: unknown) {
            res.status(500).json(parseError(error, uid, this.entityName, 'retrieve'));
        }
    };

    protected buildPostQuery: QueryBuilder = ({fields, values, uid}) => {
        const allFields = [...fields, "user_uid"];
        const allValues = [...values, uid];
        const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
            INSERT INTO ${this.tableName} (${allFields.join(", ")})
            VALUES (${placeholders})
            RETURNING ${this.getQueryFields(this.tableName)};
        `;
        return {query, queryValues: allValues};
    };

    protected buildPatchQuery: QueryIdBuilder = ({fields, values, uid, id}) => {
        let idx = 1;
        const setClauses = fields.map(f => `${f} = $${idx++}`);
        const uidPlaceholder = `$${idx++}`;
        const idPlaceholder = `$${idx}`;

        const query = `
            UPDATE ${this.tableName}
            SET ${setClauses.join(", ")},
                updated_at = CURRENT_TIMESTAMP
            WHERE user_uid = ${uidPlaceholder}
              AND id = ${idPlaceholder}
            RETURNING ${this.getQueryFields(this.tableName)};
        `;
        return {query, queryValues: [...values, uid, id]};
    };
}