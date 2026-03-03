import {Validator} from "../types/components";
import {DB} from "../utils/db";
import {isBody} from "../utils/general";
import {Request} from "express";

export const validateCategory: Validator = async (db: DB, req: Request, uid: string) => {
    if (!isBody(req.body)) return {message: "Body of the request is missing"};
    if (!req.body.category_id || typeof req.body.category_id !== 'string') return {message: "Correct category is mandatory"};

    const catResult = await db.query(
        "SELECT id FROM categories WHERE id = $1 AND user_uid = $2",
        [req.body.category_id, uid]
    );

    if (catResult.rows.length === 0) return {message: "Invalid category", context: {categoryId: req.body.category_id}};
    return null;
};