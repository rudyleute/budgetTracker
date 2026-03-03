import {BaseController} from "./base";
import {
    categoriesGetSchema,
    categoriesPatchSchema,
    categoriesPostSchema, CategoryGet,
    CategoryGetSchema
} from "../types/components/categories";
import {Logger} from "../utils/logger";
import {DB} from "../utils/db";
import {Request, Response} from "express";
import {CustomError, GetRes} from "../types/basic";
import {processCategories} from "../utils/processers";
import {parseError} from "../utils/parsers";
import {QueryBuilder, QueryIdBuilder} from "../types/components";

export class CategoriesController extends BaseController<CategoryGetSchema> {
    constructor(db: DB, logger: Logger) {
        super({
            db, logger,
            entityName: 'category',
            tableName: 'categories',
            schemas: {
                get: categoriesGetSchema,
                post: categoriesPostSchema,
                patch: categoriesPatchSchema
            }
        });

        this.router.get('/', this.getCategories);
    }

    private getCategories = async (req: Request, res: Response<GetRes<CategoryGet> | CustomError>) => {
        const uid = req.user!.uid;

        try {
            this.logger.debug('Fetching categories', {uid});

            const result = await this.db.query(
                "SELECT * FROM categories WHERE user_uid = $1;",
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
            INSERT INTO categories (${allFields.join(", ")})
            VALUES (${placeholders})
            RETURNING id, color, name, created_at, updated_at;
        `;
        return {query, queryValues: allValues};
    };

    protected buildPatchQuery: QueryIdBuilder = ({fields, values, uid, id}) => {
        let idx = 1;
        const setClauses = fields.map(f => `${f} = $${idx++}`);
        const uidPlaceholder = `$${idx++}`;
        const idPlaceholder = `$${idx}`;

        const query = `
            UPDATE categories
            SET ${setClauses.join(", ")},
                updated_at = CURRENT_TIMESTAMP
            WHERE user_uid = ${uidPlaceholder}
              AND id = ${idPlaceholder}
            RETURNING id, color, name, created_at, updated_at;
        `;
        return {query, queryValues: [...values, uid, id]};
    };
}