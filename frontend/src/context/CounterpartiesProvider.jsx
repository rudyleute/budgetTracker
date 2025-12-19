import { createContext, useContext, useMemo } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource.js';

const defaultQueryParams = {
  filter: "", balance: true
};

const CounterpartiesContext = createContext({});
const CounterpartiesProvider = ({ children }) => {
  const {
    items: counterparties,
    queryParams: counterpartiesQueryParams,
    addItem: addCounterparty,
    editItem: editCounterparty,
    deleteItem: deleteCounterparty,
    getNextPage: getNextCounterpartiesPage,
    updateQueryParams: updateCounterpartiesQueryParams,
    resetQueryParams: resetCounterpartiesQueryParams,
    GetLoader: CounterpartiesGetLoader,
    ChangeLoader: CounterpartiesChangeLoader
  } = usePaginatedResource({
    endpoint: "/counterparties",
    defaultQueryParams,
    entityName: 'counterparty'
  });

  const value = useMemo(() => ({
    counterparties,
    counterpartiesQueryParams,
    addCounterparty,
    editCounterparty,
    deleteCounterparty,
    getNextCounterpartiesPage,
    updateCounterpartiesQueryParams,
    resetCounterpartiesQueryParams,
    CounterpartiesGetLoader,
    CounterpartiesChangeLoader
  }), [CounterpartiesChangeLoader, CounterpartiesGetLoader, addCounterparty, deleteCounterparty, editCounterparty, getNextCounterpartiesPage, counterparties, counterpartiesQueryParams, resetCounterpartiesQueryParams, updateCounterpartiesQueryParams])

  return (<CounterpartiesContext.Provider value={value}>
    {children}
  </CounterpartiesContext.Provider>);
}

const useCounterparties = () => useContext(CounterpartiesContext);
export { useCounterparties, CounterpartiesProvider }