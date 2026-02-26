import express from 'express';
import db from '../utils/db';
import logger from '../utils/logger';
import {handleUpsert, handleDelete} from './generic';
import {buildPostQuery, buildPatchQuery} from "../helpers/categoriesQuery";
import { categoriesGetSchema, categoriesPatchSchema, categoriesPostSchema, CategoryGet } from "../types/categories";
import {CustomError, GetRes} from "../types/basic";
import {Response, Request} from "express";
import {processCategories} from "../utils/entities/categories";
import {isUser} from "../utils/general";
import {parseError} from "../utils/parsers";

const entityName = "categories";
const router = express.Router();

const getCategories = async (req: Request, res: Response<GetRes | CustomError>) => {
    if (!isUser(req, res)) return;

    try {
        const uid = req.user.uid;

        logger.debug('Fetching categories', {uid});

        const result = await db.query(
            "SELECT * FROM categories WHERE user_uid = $1;",
            [uid]
        );

        logger.info('Categories retrieved successfully', {
            uid,
            count: result.rows.length
        });

        res.status(200).json({data: processCategories(result.rows)});
    } catch (error: unknown) {
        res.status(500).json(parseError(error, req.user.uid, entityName, 'retrieve'));
    }
};

const createCategory = (req: Request, res: Response<CategoryGet | CustomError>) =>
    handleUpsert({
            req,
            res,
            entityName: "category",
            schema: categoriesPostSchema,
            responseSchema: categoriesGetSchema,
            buildQuery: buildPostQuery
        }, db, logger
    );

const updateCategory = (req: Request, res: Response<CategoryGet | CustomError>) =>
    handleUpsert({
            req,
            res,
            entityName: "category",
            schema: categoriesPatchSchema,
            responseSchema: categoriesGetSchema,
            buildQuery: buildPatchQuery
        }, db, logger
    );

const deleteCategory = (req: Request, res: Response<CustomError | void>) =>
    handleDelete({
            table: 'categories',
            idField: 'id',
            entityName: 'category',
            req,
            res
        }, db, logger
    );

router.get('/', getCategories);
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;