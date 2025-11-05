import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const defCategories = [
  { id: uuidv4(), color: "#5B5FEF", name: "Health insurance" },
  { id: uuidv4(), color: "#E85A93", name: "Food" },
  { id: uuidv4(), color: "#F9C74F", name: "Snacks" },
  { id: uuidv4(), color: "#3FC1A1", name: "Leisure" },
  { id: uuidv4(), color: "#9B5DE5", name: "Transport" },
  { id: uuidv4(), color: "#F15BB5", name: "Utilities" },
  { id: uuidv4(), color: "#00BBF9", name: "Entertainment" },
  { id: uuidv4(), color: "#00F5D4", name: "Dining out" },
  { id: uuidv4(), color: "#5B5FEF", name: "Insurance" }
];

const CategoriesContext = createContext({});
const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setCategories(defCategories);
  }, []);

  return (
    <CategoriesContext.Provider value={{categories}}>
      {children}
    </CategoriesContext.Provider>
  )
}

const useCategories = () => useContext(CategoriesContext);
export { CategoriesProvider, useCategories };