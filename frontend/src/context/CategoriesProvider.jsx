import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { formToast, sanitizeData } from '../helpers/transformers.jsx';
import api from '../services/axios.js';

const toastCatBody = (name, action) => {
  return formToast(<>Category <b>"{name}"</b> has been successfully {action}!</>);
}

const CategoriesContext = createContext({});
const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const result = await api.get('/categories');

      if (!isMounted) return;

      if (!result.data) {
        toast.error(formToast(result.message))
        setCategories([]);
        return;
      }

      setCategories(result.data.data);
    })();

    return () => {
      isMounted = false;
    }
  }, []);

  const addCategory = async (category) => {
    const sanCategory = sanitizeData(category);
    const { label, ...rest } = sanCategory;

    const res = await api.post('/categories', { ...rest });
    if (!res.data) {
      toast.error(formToast(res.message));
      return;
    }

    setCategories(prev => [...prev, res.data]);
    toast.success(toastCatBody(category.name, "created"))
    return res.data;
  }

  const editCategory = async (id, category) => {
    const sanCategory = sanitizeData(category);
    const { label, ...rest } = sanCategory;

    const res = await api.put(`/categories/${id}`, { ...rest });

    if (!res.data) {
      toast.error(formToast(res.message));
      return;
    }

    setCategories(prev => prev.map(item => {
      if (item.id !== id) return item;
      return res.data
    }))
    toast.success(toastCatBody(category.name, "edited"))
    return res.data;
  }

  const deleteCategory = async (id) => {
    const res = await api.delete(`/categories/${id}`);

    if (res.status !== 204) {
      toast.error(formToast(`Failed to delete category: ${res.message}`));
      return;
    }

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