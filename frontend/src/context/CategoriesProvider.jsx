import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/transformers.jsx';
import api from '../services/axios.js';

const toastCatBody = (name, action) => {
  return formToast(<>Category <b>"{name}"</b> has been successfully {action}!</>);
}

const defaultValue = {
  data: [],
  dataMap: {}
};
const CategoriesContext = createContext({});
const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState(defaultValue);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const res = await api.get('/categories');

      if (!isMounted) return;
      if (!res.data) {
        toast.error(formToast(res.message))
        setCategories(defaultValue);
        return;
      }

      setCategories({
        data: res.data.data,
        dataMap: res.data.data.reduce((acc, cur) => {
          acc[cur.id] = cur;
          return acc;
        }, {})
      });
    })();

    return () => {
      isMounted = false;
    }
  }, []);

  const addCategory = async (data) => {
    const { data: category, message } = await api.post('/categories', data);
    if (!category) {
      toast.error(formToast(message));
      return;
    }

    setCategories(prev => ({
      data: [...prev.data, category],
      dataMap: { ...prev.dataMap, [category.id]: category }
    }));
    toast.success(toastCatBody(category.name, "created"))
    return category;
  }

  const editCategory = async (id, data) => {
    const { data: category, message } = await api.put(`/categories/${id}`, data);

    if (!category) {
      toast.error(formToast(message));
      return;
    }

    setCategories(prev => ({
      data: prev.data.map((item) => {
        if (item.id !== category.id) return item;
        return category;
      }),
      dataMap: { ...prev.dataMap, [category.id]: category }
    }))
    toast.success(toastCatBody(category.name, "edited"))
    return category;
  }

  const deleteCategory = async (id) => {
    const { status, message } = await api.delete(`/categories/${id}`);

    if (status !== 204) {
      toast.error(formToast(`Failed to delete category: ${message}`));
      return;
    }

    setCategories(prev => {
      const categoryToDelete = prev.dataMap[id];
      const newMap = { ...prev.dataMap };
      delete newMap[categoryToDelete.id];

      setTimeout(() => {
        toast.success(toastCatBody(categoryToDelete.name, "deleted"))
      }, 0);

      return {
        data: prev.data.filter(item => item.id !== id),
        dataMap: newMap
      };
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