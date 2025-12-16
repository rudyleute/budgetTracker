import { createContext, useContext, useMemo } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource.js';

const defaultQueryParams = {
  filter: "",
  from: "",
  to: ""
};

const TransactionsContext = createContext({});
const TransactionsProvider = ({ children }) => {
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
  } = usePaginatedResource({
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