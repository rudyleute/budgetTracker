import { createContext, useContext, useMemo } from 'react';
import usePagRes from '../hooks/usePaginatedResource';
import { TransactionsRequestQuery } from '@app/shared';
import {ChildrenProp} from "../types/basic";

const defaultQueryParams: TransactionsRequestQuery = {
    filter: "",
    from: "",
    to: ""
};

const TransactionsContext = createContext({});
const TransactionsProvider = ({ children }: ChildrenProp) => {
    const {
        items: transactions,
        queryParams: queryTransParams,
        addItem: addTransaction,
        editItem: editTransaction,
        deleteItem: deleteTransaction,
        getNextPage: getNextTransactionsPage,
        updateQueryParams: updateTransQueryParams,
        resetQueryParams: resetTransQueryParams,
        GetLoader: TransGetLoader,
        ChangeLoader: TransChangeLoader
    } = usePagRes({
        endpoint: '/transactions',
        defaultQueryParams,
        entityName: 'transaction'
    })

    const value = useMemo(() => ({
        transactions,
        addTransaction,
        deleteTransaction,
        editTransaction,
        getNextTransactionsPage,
        updateTransQueryParams,
        resetTransQueryParams,
        queryTransParams,
        TransGetLoader,
        TransChangeLoader
    }), [TransChangeLoader, TransGetLoader, addTransaction, deleteTransaction, editTransaction, getNextTransactionsPage, queryTransParams, resetTransQueryParams, transactions, updateTransQueryParams])

    return (
        <TransactionsContext.Provider value={value}>
            {children}
        </TransactionsContext.Provider>
    )
}

const useTransactions = () => useContext(TransactionsContext);
export { TransactionsProvider, useTransactions };