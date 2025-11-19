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
  data: {},
  total: 0
};
const TransactionsContext = createContext({});
const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(defaultValue)

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { data: newTransactions, message } = await api.get('/transactions');

      if (!isMounted) return;
      if (!newTransactions) {
        toast.error(formToast(message));
        setTransactions(defaultValue);
        return;
      }

      const { keys, groups: data } = groupBy(newTransactions.data, "timestamp", (date) => getDate(date, {
        year: 'numeric',
        month: 'long'
      }));
      setTransactions({ keys, data, total: newTransactions.data.length });
    })();

    return () => isMounted = false;
  }, []);

  const insertTransactionUI = (keys, oldTransactions, month, newTrans) => {
    if (keys.includes(month)) {
      const ind = _.sortedIndexBy(oldTransactions[month], newTrans, (t) => -new Date(t.timestamp))
      return {
        keys,
        data: {
          ...oldTransactions,
          [month]: [...oldTransactions[month].slice(0, ind), newTrans, ...oldTransactions[month].slice(ind)]
        }
      }
    }

    const ind = _.sortedIndexBy(keys, newTrans.timestamp, (t) => -new Date(t))
    return {
      keys: [...keys.slice(0, ind), month, ...keys.slice(ind)],
      data: { ...oldTransactions, [month]: [newTrans] }
    }
  }

  const addTransaction = async (data) => {
    const { data: newTrans, message } = await api.post('/transactions', sanitizeData(data));
    if (!newTrans) {
      toast.error(formToast(message));
      return;
    }

    const newMonth = getDate(newTrans.timestamp, {
      month: 'long',
      year: 'numeric'
    });

    const res = insertTransactionUI(transactions.keys, transactions.data, newMonth, newTrans);
    setTransactions({ ...res, total: transactions.total + 1 });

    toast.success(toastBody(newTrans.name, newTrans.timestamp, "created"))
    return newTrans;
  }

  const editTransaction = async (month, id, data) => {
    const { data: newTrans, message } = await api.put(`/transactions/${id}`, sanitizeData(data));
    if (!newTrans) {
      toast.error(formToast(message));
      return;
    }

    const incmpTransactions = transactions.data[month].filter(item => item.id !== id);
    const newMonth = getDate(newTrans.timestamp, {
      month: 'long',
      year: 'numeric'
    })

    if (newMonth === month) {
      const ind = _.sortedIndexBy(incmpTransactions, newTrans, (t) => -new Date(t.timestamp))
      setTransactions(prev => ({
        keys: prev.keys,
        data: {
          ...prev.data,
          [month]: [...incmpTransactions.slice(0, ind), newTrans, ...incmpTransactions.slice(ind)]
        },
        total: prev.total
      }))
    } else {
      const res = insertTransactionUI(transactions.keys,
        {
          ...transactions.data,
          [month]: incmpTransactions
        }, newMonth, newTrans);

      setTransactions({ ...res, total: transactions.total });
    }

    toast.success(toastBody(newTrans.name, newTrans.timestamp, "edited"))
    return newTrans;
  }

  const deleteTransaction = async (month, id) => {
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
      total: prev.total - 1
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