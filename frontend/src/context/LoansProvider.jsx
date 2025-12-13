import { createContext, useContext } from 'react';
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

  return (<LoansContext.Provider value={{
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
  }}>
    {children}
  </LoansContext.Provider>);
}

const useLoans = () => useContext(LoansContext);
export { useLoans, LoansProvider }