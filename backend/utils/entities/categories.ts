import {categoriesGetSchema, CategoryGet} from "../../types/categories";
import {QueryResult} from "pg";

export const processCategories = (values: QueryResult['rows']): CategoryGet[] => {
    return values.map(elem => categoriesGetSchema.parse(elem));
};