import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/transformers.jsx';

const defCategories = [
  { id: uuidv4(), color: "#5B5FEF", name: "Health insurance" },
  { id: uuidv4(), color: "#E85A93", name: "Food" },
  { id: uuidv4(), color: "#F9C74F", name: "Snacks" },
  { id: uuidv4(), color: "#3FC1A1", name: "Leisure" },
  { id: uuidv4(), color: "#9B5DE5", name: "Transport" },
  { id: "2", color: "#F15BB5", name: "Utilities" },
  { id: uuidv4(), color: "#00BBF9", name: "Entertainment" },
  { id: uuidv4(), color: "#00F5D4", name: "Dining out" },
  { id: uuidv4(), color: "#5B5FEF", name: "Insurance" }
];

const toastCatBody = (name, action) => {
  return formToast(<>Category <b>"{name}"</b> has been successfully {action}!</>);
}

const CategoriesContext = createContext({});
const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setCategories(defCategories);
  }, []);

  const addCategory = async (category) => {
    const { label, ...rest } = category
    const catWithId = { ...rest, id: uuidv4() }
    setCategories(prev => [...prev, catWithId])

    toast.success(toastCatBody(category.name, "created"))
    return catWithId;
  }

  const editCategory = async (id, category) => {
    setCategories(prev => prev.map(item => {
      if (item.id !== id) return item;
      const { label, ...rest } = category
      return rest
    }))

    toast.success(toastCatBody(category.name, "edited"))
    return category;
  }

  const deleteCategory = async (id) => {
    setCategories(prev => {
      const categoryToDelete = prev.find(item => item.id === id);
      const newList = prev.filter(item => item.id !== id);

      setTimeout(() => {
        toast.success(toastCatBody(categoryToDelete.name, "deleted"))
      }, 0)

      return newList;
    })
  }

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, editCategory, deleteCategory }}>
      {children}
    </CategoriesContext.Provider>
  )
}

const useCategories = () => useContext(CategoriesContext);
export { CategoriesProvider, useCategories };