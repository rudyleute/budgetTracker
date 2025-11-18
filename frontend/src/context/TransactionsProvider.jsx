import { createContext, useContext, useEffect, useState } from 'react';
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

const defaultValue = {
  keys: [],
  data: {}
};
const TransactionsContext = createContext({});
const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(defaultValue)

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const res = await api.get('/transactions');

      if (!isMounted) return;
      if (!res.data) {
        toast.error(formToast(res.message));
        setTransactions(defaultValue);
        return;
      }

      const { keys, groups: data } = groupBy(res.data.data, "timestamp", (date) => getDate(date, {
        year: 'numeric',
        month: 'long'
      }));
      setTransactions({ keys, data });
    })();

    return () => isMounted = false;
  }, []);

  const addTransactionUI = (date, data) => {
    if (transactions.keys.includes(date)) {
      const ind = _.sortedIndexBy(transactions.data[date], data, (t) => -new Date(t.timestamp))
      setTransactions(prev => ({
        keys: prev.keys,
        data: {
          ...prev.data,
          [date]: [...prev.data[date].slice(0, ind), data, ...prev.data[date].slice(ind)]
        }
      }))
    } else {
      const ind = _.sortedIndexBy(transactions.keys, data.timestamp, (t) => -new Date(t))
      setTransactions(prev => ({
        keys: [...prev.keys.slice(0, ind), date, ...prev.keys.slice(ind)],
        data: {
          ...prev.data,
          [date]: [data]
        }
      }));
    }
  }

  const addTransaction = async (data) => {
    let sanData = sanitizeData(data);
    const { category, ...rest } = sanData;
    sanData = { ...rest, category_id: category?.id }

    const res = await api.post('/transactions', sanData);
    if (!res.data) {
      toast.error(formToast(res.message));
      return;
    }

    const date = getDate(res.data.timestamp, {
      month: 'long',
      year: 'numeric'
    });

    addTransactionUI(date, res.data);
    toast.success(toastBody(res.data.name, res.data.timestamp, "created"))
    return res.data;
  }

  const editTransaction = async (month, id, data) => {
    let sanData = sanitizeData(data);
    const { category, ...rest } = sanData;
    sanData = { ...rest, category_id: category?.id }

    const res = await api.put(`/transactions/${id}`, sanData);
    if (!res.data) {
      toast.error(formToast(res.message));
      return;
    }

    const newData = transactions.data[month].filter(item => item.id !== id);
    const newDate = getDate(res.data.timestamp, {
      month: 'long',
      year: 'numeric'
    })

    if (newDate === month) {
      const ind = _.sortedIndexBy(newData, res.data, (t) => -new Date(t.timestamp))
      setTransactions(prev => ({
        keys: prev.keys,
        data: {
          ...prev.data,
          [month]: [...newData.slice(0, ind), res.data, ...newData.slice(ind)]
        }
      }))
    } else {
      setTransactions(prev => ({
        keys: prev.keys,
        data: {
          ...prev.data,
          [month]: newData
        }
      }))

      addTransactionUI(newDate, res.data);
    }

    toast.success(toastBody(res.data.name, res.data.timestamp, "edited"))
    return res.data;
  }

  const deleteTransaction = async (month, id) => {
    const res = await api.delete(`/transactions/${id}`);
    if (res.status !== 204) {
      toast.error(formToast(res.message));
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
      }
    }))

    toast.success(toastBody(categoryToDelete.name, categoryToDelete.timestamp, "deleted"))
  }

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, deleteTransaction, editTransaction }}>
      {children}
    </TransactionsContext.Provider>
  )
}

const useTransactions = () => useContext(TransactionsContext);
export { TransactionsProvider, useTransactions };