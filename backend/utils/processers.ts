import {CategoriesGet, categoriesGetSchema} from "../types/components/categories";
import {QueryResult} from "pg";
import {CounterpartiesGet, counterpartiesGetSchema} from "../types/components/counterparties";

export const processCategories = (values: QueryResult['rows']): CategoriesGet => {
    return values.map(elem => categoriesGetSchema.parse(elem));
};

export const processCounterparties = (values: QueryResult['rows']): CounterpartiesGet => {
    return values.map(elem => counterpartiesGetSchema.parse(elem));
};