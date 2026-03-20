import {CategoriesGetServer, categoriesGetSchema} from "../types/controllers/categories";
import {QueryResult} from "pg";
import {CounterpartiesGetServer, counterpartiesGetSchema} from "../types/controllers/counterparties";
import {LoansGetServer, loansGetSchema} from "../types/controllers/loans";
import {TransactionsGetServer, transactionsGetSchema} from "../types/controllers/transactions";

export const processCategories = (values: QueryResult['rows']): CategoriesGetServer => {
    return values.map(elem => categoriesGetSchema.parse(elem));
};

export const processCounterparties = (values: QueryResult['rows']): CounterpartiesGetServer => {
    return values.map(elem => counterpartiesGetSchema.parse(elem));
};

export const processLoans = (values: QueryResult['rows']): LoansGetServer => {
    return values.map(elem => loansGetSchema.parse(elem));
};

export const processTransactions = (values: QueryResult['rows']): TransactionsGetServer => {
    return values.map(elem => transactionsGetSchema.parse(elem));
};