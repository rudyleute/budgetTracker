import { createContext, useContext, useMemo } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource.js';

const defaultQueryParams = {
  from: "", to: "", type: "", priority: "", sort: "", order: "", counterparty: ""
};
const sortByOptions = [
  "name", "timestamp", "sum", "deadline", "type", "priority"
]
const priorities = ['high', 'medium', 'low'];
const types = ["borrowed", "lent"]

const LoansContext = createContext({});
const LoansProvider = ({ children }) => {
  const {
    items: loans,
    queryParams: loansQueryParams,
    addItem: addLoan,
    editItem: editLoan,
    deleteItem: deleteLoan,
    getNextPage: getNextLoansPage,
    updateQueryParams: updateLoansQueryParams,
    resetQueryParams: resetLoansQueryParams,
    GetLoader: LoansGetLoader,
    ChangeLoader: LoansChangeLoader
  } = usePaginatedResource({
    endpoint: "/loans",
    defaultQueryParams,
    entityName: 'loan'
  });

  const value = useMemo(() => ({
    loans,
    loansQueryParams,
    addLoan,
    editLoan,
    deleteLoan,
    getNextLoansPage,
    updateLoansQueryParams,
    resetLoansQueryParams,
    LoansGetLoader,
    LoansChangeLoader,
    priorities,
    types,
    sortByOptions
  }), [LoansChangeLoader, LoansGetLoader, addLoan, deleteLoan, editLoan, getNextLoansPage, loans, loansQueryParams, resetLoansQueryParams, updateLoansQueryParams])

  return (<LoansContext.Provider value={value}>
    {children}
  </LoansContext.Provider>);
}

const useLoans = () => useContext(LoansContext);
export { useLoans, LoansProvider }