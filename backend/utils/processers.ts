import {CategoriesGet, categoriesGetSchema} from "../types/components/categories";
import {QueryResult} from "pg";
import {CounterpartiesGet, counterpartiesGetSchema} from "../types/components/counterparties";
import {LoansGet, loansGetSchema} from "../types/components/loans";
import {TransactionsGet, transactionsGetSchema} from "../types/components/transactions";

export const processCategories = (values: QueryResult['rows']): CategoriesGet => {
    return values.map(elem => categoriesGetSchema.parse(elem));
};

export const processCounterparties = (values: QueryResult['rows']): CounterpartiesGet => {
    return values.map(elem => counterpartiesGetSchema.parse(elem));
};

export const processLoans = (values: QueryResult['rows']): LoansGet => {
    return values.map(elem => loansGetSchema.parse(elem));
};

export const processTransactions = (values: QueryResult['rows']): TransactionsGet => {
    return values.map(elem => transactionsGetSchema.parse(elem));
};