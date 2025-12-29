import { createContext, useCallback, useContext, useMemo } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource.js';
import api from '../services/axios.js';
import { toast } from 'react-toastify';
import { formToast, formToastMain } from '../helpers/toast.jsx';

const defaultQueryParams = {
  from: "", to: "", type: "", priority: "", sort: "", order: "", counterparty: ""
};
const sortByOptions = [
  "name", "timestamp", "sum", "deadline", "type", "priority"
]
const priorities = ['high', 'medium', 'low'];
const types = ["borrowed", "lent"]
const endpoint = '/loans'

const LoansContext = createContext({});
const LoansProvider = ({ children, skipInitFetch=false }) => {
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
    ChangeLoader: LoansChangeLoader,
    showChangeLoader,
    hideChangeLoader,
    fetchItemsFromStart,
    total
  } = usePaginatedResource({
    endpoint,
    defaultQueryParams,
    entityName: 'loan',
    skipInitFetch
  });

  const closeLoan = useCallback(async (id) => {
    showChangeLoader();
    const { data: updatedItem, message } = await api.patch(`${endpoint}/${id}/close`);

    if (!updatedItem) {
      toast.error(formToast(message));
      hideChangeLoader();
      return null;
    }

    toast.success(formToastMain('loan', updatedItem.name, updatedItem["timestamp"], "closed"));

    const res = await fetchItemsFromStart(total);
    hideChangeLoader();

    if (!res) return null;
    return updatedItem;
  }, [fetchItemsFromStart, hideChangeLoader, showChangeLoader, total])

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
    sortByOptions,
    closeLoan
  }), [LoansChangeLoader, LoansGetLoader, addLoan, deleteLoan, editLoan, getNextLoansPage, loans, loansQueryParams, resetLoansQueryParams, updateLoansQueryParams, closeLoan])

  return (<LoansContext.Provider value={value}>
    {children}
  </LoansContext.Provider>);
}

const useLoans = () => useContext(LoansContext);
export { useLoans, LoansProvider }