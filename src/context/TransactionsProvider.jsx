import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDate, groupBy } from '../helpers/transformers.js';

const trans = [
  {
    id: uuidv4(),
    createdAt: "2025-10-31T08:12:15.000Z",
    category: { id: uuidv4(), color: "#5B5FEF", name: "Health insurance" },
    price: 150,
    name: "Monthly premium payment"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T09:45:20.000Z",
    category: { id: uuidv4(), color: "#E85A93", name: "Food" },
    price: 45,
    name: "Supermarket groceries"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T10:18:54.000Z",
    category: { id: uuidv4(), color: "#F9C74F", name: "Snacks" },
    price: 8,
    name: "Chips and soda"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T12:40:05.000Z",
    category: { id: uuidv4(), color: "#3FC1A1", name: "Leisure" },
    price: 20,
    name: "Streaming subscription"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T14:02:45.000Z",
    category: { id: uuidv4(), color: "#9B5DE5", name: "Transport" },
    price: 16,
    name: "Taxi to work"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T15:27:18.000Z",
    category: { id: uuidv4(), color: "#F15BB5", name: "Utilities" },
    price: 65,
    name: "Electricity bill"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T17:33:29.000Z",
    category: { id: uuidv4(), color: "#00BBF9", name: "Entertainment" },
    price: 30,
    name: "Concert ticket"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-31T20:51:12.000Z",
    category: { id: uuidv4(), color: "#00F5D4", name: "Dining out" },
    price: 55,
    name: "Dinner with friends"
  },

  // Other random dates
  {
    id: uuidv4(),
    createdAt: "2025-10-30T06:01:55.000Z",
    category: { id: uuidv4(), color: "#F9C74F", name: "Snacks" },
    price: 12,
    name: "Different drinks and sweets"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-29T18:32:10.000Z",
    category: { id: uuidv4(), color: "#3FC1A1", name: "Leisure" },
    price: 10,
    name: "A movie ticket"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-28T10:14:03.000Z",
    category: { id: uuidv4(), color: "#E85A93", name: "Food" },
    price: 80,
    name: "Weekly grocery shopping"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-25T08:25:33.000Z",
    category: { id: uuidv4(), color: "#9B5DE5", name: "Transport" },
    price: 25,
    name: "Bus pass"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-22T13:45:02.000Z",
    category: { id: uuidv4(), color: "#F15BB5", name: "Utilities" },
    price: 45,
    name: "Water bill"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-18T16:54:45.000Z",
    category: { id: uuidv4(), color: "#00BBF9", name: "Entertainment" },
    price: 25,
    name: "Arcade games"
  },
  {
    id: uuidv4(),
    createdAt: "2025-10-14T19:02:55.000Z",
    category: { id: uuidv4(), color: "#00F5D4", name: "Dining out" },
    price: 38,
    name: "Lunch with coworkers"
  },
  {
    id: uuidv4(),
    createdAt: "2025-09-29T15:42:10.000Z",
    category: { id: uuidv4(), color: "#3FC1A1", name: "Leisure" },
    price: 10,
    name: "A movie ticket"
  },
  {
    id: uuidv4(),
    createdAt: "2025-09-25T12:11:27.000Z",
    category: { id: uuidv4(), color: "#E85A93", name: "Food" },
    price: 120,
    name: "Weekly grocery shopping"
  },
  {
    id: uuidv4(),
    createdAt: "2025-09-20T08:56:31.000Z",
    category: { id: uuidv4(), color: "#5B5FEF", name: "Insurance" },
    price: 150,
    name: "Car insurance"
  },
  {
    id: uuidv4(),
    createdAt: "2025-09-17T07:42:13.000Z",
    category: { id: uuidv4(), color: "#F15BB5", name: "Utilities" },
    price: 70,
    name: "Gas bill"
  },
  {
    id: uuidv4(),
    createdAt: "2025-09-12T18:04:22.000Z",
    category: { id: uuidv4(), color: "#00BBF9", name: "Entertainment" },
    price: 40,
    name: "Online game purchase"
  },
  {
    id: uuidv4(),
    createdAt: "2025-09-10T14:22:44.000Z",
    category: { id: uuidv4(), color: "#00F5D4", name: "Dining out" },
    price: 28,
    name: "Takeout lunch"
  },
  {
    id: uuidv4(),
    createdAt: "2025-08-29T07:15:23.000Z",
    category: { id: uuidv4(), color: "#E85A93", name: "Food" },
    price: 130,
    name: "Weekly grocery shopping"
  },
  {
    id: uuidv4(),
    createdAt: "2025-08-20T09:42:12.000Z",
    category: { id: uuidv4(), color: "#9B5DE5", name: "Transport" },
    price: 60,
    name: "Gas refill"
  },
  {
    id: uuidv4(),
    createdAt: "2025-08-12T19:28:10.000Z",
    category: { id: uuidv4(), color: "#5B5FEF", name: "Insurance" },
    price: 100,
    name: "Home insurance"
  },
  {
    id: uuidv4(),
    createdAt: "2025-08-05T06:17:42.000Z",
    category: { id: uuidv4(), color: "#3FC1A1", name: "Leisure" },
    price: 15,
    name: "Mini golf"
  },
  {
    id: uuidv4(),
    createdAt: "2025-07-28T11:32:21.000Z",
    category: { id: uuidv4(), color: "#F15BB5", name: "Utilities" },
    price: 80,
    name: "Internet bill"
  },
  {
    id: uuidv4(),
    createdAt: "2025-07-18T08:44:33.000Z",
    category: { id: uuidv4(), color: "#E85A93", name: "Food" },
    price: 90,
    name: "Groceries and household supplies"
  },
  {
    id: uuidv4(),
    createdAt: "2025-07-11T16:57:54.000Z",
    category: { id: uuidv4(), color: "#00BBF9", name: "Entertainment" },
    price: 22,
    name: "Cinema night"
  },
  {
    id: uuidv4(),
    createdAt: "2025-07-01T12:27:03.000Z",
    category: { id: uuidv4(), color: "#00F5D4", name: "Dining out" },
    price: 50,
    name: "Dinner at Italian restaurant"
  },
  {
    id: uuidv4(),
    createdAt: "2025-06-20T09:05:27.000Z",
    category: { id: uuidv4(), color: "#9B5DE5", name: "Transport" },
    price: 30,
    name: "Train ticket"
  }
];

const TransactionsContext = createContext({});
const TransactionsProvider = ({children}) => {
  const [transactions, setTransactions] = useState({
    keys: [],
    data: {}
  })

  useEffect(() => {
    const { keys, groups: data } = groupBy(trans, "createdAt", (date) => getDate(date, {
      month: 'long',
      year: 'numeric'
    }));

    setTransactions({ keys, data });
  }, []);

  return (
    <TransactionsContext.Provider value={{transactions}}>
      {children}
    </TransactionsContext.Provider>
  )
}

const useTransactions = () => useContext(TransactionsContext);
export { TransactionsProvider, useTransactions };