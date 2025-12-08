import { createContext, useContext } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource.js';

const defaultQueryParams = {
  filter: "",
  from: "",
  to: "",
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
    entityName: 'transaction',
  })

  return (
    <TransactionsContext.Provider value={{
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
    }}>
      {children}
    </TransactionsContext.Provider>
  )
}

const useTransactions = () => useContext(TransactionsContext);
export { TransactionsProvider, useTransactions };