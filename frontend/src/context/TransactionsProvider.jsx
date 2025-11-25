import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { formToast, getDate } from '../helpers/transformers.jsx';
import _ from 'lodash';
import { toast } from 'react-toastify';
import api from '../services/axios.js';

const toastBody = (name, timestamp, action) => {
  return formToast(<>
    Transaction <b>"{name}"</b> at <b>{getDate(timestamp, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
    day: '2-digit'
  })}</b> has been successfully {action}!
  </>);
}

const defaultQueryParams = {
  filter: "",
  from: "",
  to: "",
};
const defaultValue = { data: [], total: 0, isLastPage: true };

const TransactionsContext = createContext({});
const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(defaultValue);
  const [queryParams, setQueryParams] = useState(defaultQueryParams);

  const fetchTransactions = useCallback(async () => {
    const { data: newTransactions, message } = await api.get('/transactions', { ...queryParams, offset: 0 });

    if (!newTransactions) {
      toast.error(formToast(message));
      return false;
    }

    setTransactions({ data: newTransactions.data, total: newTransactions.data.length, isLastPage: newTransactions.isLastPage });

    return true;
  }, [queryParams]);

  useEffect(() => {
    (async () => {
      if (!await fetchTransactions()) setTransactions(defaultValue);
    })();
  }, [fetchTransactions]); //transitively depends on queryParams

  const updateQueryParams = useCallback((values) => {
    setQueryParams(prev => {
      const next = { ...prev };

      Object.keys(defaultQueryParams).forEach(key => {
        if (values[key] != null) next[key] = values[key];
      });
      return !_.isEqual(prev, next) ? next : prev
    });
  }, []);

  const resetQueryParams = useCallback(() => {
    setQueryParams(prev => {
      return !_.isEqual(prev, defaultQueryParams) ? defaultQueryParams : prev;
    });
  }, []);

  const addTransaction = useCallback(async (data) => {
    const { data: newTrans, message } = await api.post('/transactions', data);
    if (!newTrans) {
      toast.error(formToast(message));
      return;
    }

    setTransactions(prev => {
      const ind = _.sortedIndexBy(prev.data, newTrans, t => -new Date(t.timestamp))

      if (ind !== prev.data.length) {
        const items = [...prev.data]
        items.splice(ind, 0, newTrans);

        return {
          data: items,
          total: prev.total + 1,
          isLastPage: prev.isLastPage
        }
      } else return {...prev, isLastPage: false}; //The created element is on one of the later pages
    })

    toast.success(toastBody(newTrans.name, newTrans.timestamp, "created"))
    return newTrans;
  }, [])

  const editTransaction = useCallback(async (id, data) => {
    const { data: newTrans, message } = await api.put(`/transactions/${id}`, data);

    if (!newTrans) {
      toast.error(formToast(message));
      return;
    }

    setTransactions(prev => {
      const items = [...prev.data.filter(el => el.id !== newTrans.id)]
      const ind = _.sortedIndexBy(items, newTrans, t => -new Date(t.timestamp))

      //The edited element's new position is on one of the later pages
      if (ind === items.length) return {data: items, isLastPage: false, total: prev.total - 1};
      else {
        items.splice(ind, 0, newTrans);
        return {...prev, data: items}
      }
    });

    toast.success(toastBody(newTrans.name, newTrans.timestamp, "edited"));
    return newTrans;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const { status, message } = await api.delete(`/transactions/${id}`);
    if (status !== 204) {
      toast.error(formToast(message));
      return;
    }

    setTransactions(prev => ({
      data: prev.data.filter(el => el.id !== id),
      total: prev.total - 1,
      isLastPage: prev.isLastPage
    }))

    toast.success(formToast("Successfully deleted"))
  }, []);

  const getMoreTransactions = useCallback(async () => {
    const { data: newTransactions, message } = await api.get('/transactions', { ...queryParams, offset: transactions.total });

    if (!newTransactions) {
      toast.error(formToast(message));
      return;
    }

    console.log(newTransactions)

    setTransactions(prev => ({
      data: prev.data.concat(newTransactions.data),
      total: prev.total + newTransactions.data.length,
      isLastPage: newTransactions.isLastPage
    }));
  }, [transactions.total, queryParams]);

  return (
    <TransactionsContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      editTransaction,
      fetchTransactions,
      getMoreTransactions,
      updateQueryParams,
      resetQueryParams,
      queryParams
    }}>
      {children}
    </TransactionsContext.Provider>
  )
}

const useTransactions = () => useContext(TransactionsContext);
export { TransactionsProvider, useTransactions };