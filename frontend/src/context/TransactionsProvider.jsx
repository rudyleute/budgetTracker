import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { formToast, getDate, groupBy, sanitizeData } from '../helpers/transformers.jsx';
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

const shouldStateInsert = (keys, newTrans, newMonthTrans, updTransData, newMonth) => {
  //Is the new month last in the list of rendered ones
  const isLastMonth = keys.includes(newMonth) ? newMonth === keys.at(-1) :
    (_.sortedIndexBy(keys, newMonth, t => -new Date(t)) === keys.length);

  if (isLastMonth) {
    //Is the new transaction last in the new month
    const isLastMonthTrans = newMonthTrans.length === 0 ||
      new Date(newTrans.timestamp) < new Date(newMonthTrans.at(-1)?.timestamp);

    return !(isLastMonth && isLastMonthTrans);
  }
  return true;
}

const formStateInsert = (keys, newMonthTrans, newMonth, newTrans) => {
  if (keys.includes(newMonth)) {
    const ind = _.sortedIndexBy(newMonthTrans[newMonth], newTrans, (t) => -new Date(t.timestamp))
    return {
      keys, data: {
        ...newMonthTrans,
        [newMonth]: [...newMonthTrans[newMonth].slice(0, ind), newTrans, ...newMonthTrans[newMonth].slice(ind)]
      }
    }
  }
  const ind = _.sortedIndexBy(keys, newTrans.timestamp, (t) => -new Date(t))
  return {
    keys: [...keys.slice(0, ind), newMonth, ...keys.slice(ind)],
    data: { ...newMonthTrans, [newMonth]: [newTrans] }
  }
}

const defaultQueryParams = {
  filter: "",
  from: "",
  to: "",
};
const defaultValue = { keys: [], data: {}, total: 0, isLastPage: true };

const TransactionsContext = createContext({});
const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(defaultValue);
  const [queryParams, setQueryParams] = useState(defaultQueryParams);

  const fetchTransactions = useCallback(async () => {
    const { data: newTransactions, message } = await api.get('/transactions', { ...queryParams, total: 0 });

    if (!newTransactions) {
      toast.error(formToast(message));
      return false;
    }

    const { keys, groups: data } = groupBy(newTransactions.data, "timestamp", (date) => getDate(date, {
      year: 'numeric',
      month: 'long'
    }));
    setTransactions({ keys, data, total: newTransactions.data.length, isLastPage: newTransactions.isLastPage });

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
    const { data: newTrans, message } = await api.post('/transactions', sanitizeData(data));
    if (!newTrans) {
      toast.error(formToast(message));
      return;
    }

    const newMonth = getDate(newTrans.timestamp, {
      month: 'long',
      year: 'numeric'
    });

    const newMonthTrans = transactions.data[newMonth] ?? [];
    if (shouldStateInsert(transactions.keys, newTrans, transactions.data[newMonth] ?? [], newMonthTrans, newMonth)) {
      const res = formStateInsert(transactions.keys, transactions.data, newMonth, newTrans);
      setTransactions(prev => ({ ...prev, ...res, total: transactions.total + 1 }));
    } else setTransactions(prev => ({...prev, isLastPage: false}))

    toast.success(toastBody(newTrans.name, newTrans.timestamp, "created"))
    return newTrans;
  }, [transactions])

  const editTransaction = useCallback(async (oldMonth, id, data) => {
    const { data: newTrans, message } = await api.put(`/transactions/${id}`, sanitizeData(data));

    if (!newTrans) {
      toast.error(formToast(message));
      return;
    }

    const newMonth = getDate(newTrans.timestamp, { month: "long", year: "numeric" });

    let newKeys = [...transactions.keys];
    const updTransData = { ...transactions.data }, hasMonthChanged = newMonth !== oldMonth;

    //Remove old month of the element if the new month is different and there are no other transactions in the old month
    if (hasMonthChanged && updTransData[oldMonth].length === 1) {
      delete updTransData[oldMonth];
      newKeys = newKeys.filter(k => k !== oldMonth);
    } else updTransData[oldMonth] = updTransData[oldMonth].filter(item => item.id !== newTrans.id);

    const newMonthTrans = updTransData[newMonth] ?? [];
    if (shouldStateInsert(newKeys, newTrans, newMonthTrans, updTransData, newMonth)) {
      if (hasMonthChanged) {
        const res = formStateInsert(newKeys, updTransData, newMonth, newTrans);
        setTransactions(prev => ({ ...prev, ...res, total: transactions.total }));
      } else {
        const ind = _.sortedIndexBy(newMonthTrans, newTrans, t => -new Date(t.timestamp));
        setTransactions(prev => ({
          ...prev,
          keys: prev.keys,
          data: {
            ...prev.data,
            [newMonth]: [...newMonthTrans.slice(0, ind), newTrans, ...newMonthTrans.slice(ind)]
          }
        }));
      }
    } else {
      // The updated transaction is removed from the state and will be retrieved later from the backend in order not to
      // potentially break the chronological order
      setTransactions({
        keys: newKeys,
        data: updTransData,
        total: transactions.total - 1,
        isLastPage: false
      });
    }

    toast.success(toastBody(newTrans.name, newTrans.timestamp, "edited"));
    return newTrans;
  }, [transactions]);

  const deleteTransaction = useCallback(async (month, id) => {
    const { status, message } = await api.delete(`/transactions/${id}`);
    if (status !== 204) {
      toast.error(formToast(message));
      return;
    }

    const categoryToDelete = transactions.data[month].find(item => item.id === id);
    const newData = transactions.data[month].filter(item => item.id !== id);
    let keys = transactions.keys;

    if (newData.length === 0) {
      const ind = _.sortedIndexBy(transactions.keys, month, t => -new Date(t))
      delete newData[month];
      keys = [...transactions.keys.slice(0, ind), ...transactions.keys.slice(ind + 1)];
    }

    setTransactions(prev => ({
      keys, data: {
        ...prev.data,
        [month]: newData
      },
      total: prev.total - 1,
      isLastPage: prev.isLastPage
    }))

    toast.success(toastBody(categoryToDelete.name, categoryToDelete.timestamp, "deleted"))
  }, [transactions]);

  const getMoreTransactions = useCallback(async () => {
    const { data: newTransactions, message } = await api.get('/transactions', { ...queryParams, total: transactions.total });

    if (!newTransactions) {
      toast.error(formToast(message));
      return;
    }

    const { keys, groups: data } = groupBy(newTransactions.data, "timestamp", (date) => getDate(date, {
      year: 'numeric',
      month: 'long'
    }));
    let newState = { ...transactions, total: transactions.total + newTransactions.data.length, isLastPage: newTransactions.isLastPage };

    for (const curMonth of keys) {
      if (newState.keys.includes(curMonth)) newState.data[curMonth] = newState.data[curMonth].concat(data[curMonth]);
      else {
        const ind = _.sortedIndexBy(newState.keys, curMonth, (t) => -new Date(t))
        newState.keys = [...newState.keys.slice(0, ind), curMonth, ...newState.keys.slice(ind)];
        newState.data[curMonth] = data[curMonth]
      }
    }

    setTransactions(newState);
  }, [transactions, queryParams]);

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