import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';
import api from '../services/axios.js';
import {ChildrenProp} from "../types/basic";
import {CategoryGetClient, CategoryPatchClient, CategoryPostClient} from "../types/components/mappings";

const toastCatBody = (name: string, action: string) => {
    return formToast(<>Category <b>"{name}"</b> has been successfully {action}!</>);
}

interface CategoriesState {
    data: CategoryGetClient[],
    dataMap: Record<string, CategoryGetClient>
}
const defaultValue: CategoriesState = {
    data: [],
    dataMap: {} as CategoriesState["dataMap"]
};

const useCategoriesValue = () => {
    const [categories, setCategories] = useState<CategoriesState>(defaultValue);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            const res = await api.get<CategoryGetClient>('/categories');

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
                }, {} as CategoriesState["dataMap"])
            });
        })();

        return () => {
            isMounted = false;
        }
    }, []);

    const addCategory = useCallback(async (data: CategoryPostClient) => {
        const { data: category, message } = await api.post<CategoryGetClient>('/categories', data);
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
    }, [])

    const editCategory = useCallback(async (id: string, data: CategoryPatchClient) => {
        const { data: category, message } = await api.patch<CategoryGetClient>(`/categories/${id}`, data);

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
    }, [])

    const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
        const { status, message } = await api.delete(`/categories/${id}`);

        if (status !== 204) {
            toast.error(formToast(`Failed to delete category: ${message}`));
            return false;
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

        return true;
    }, []);

    return useMemo(() => ({
        categories,
        addCategory,
        editCategory,
        deleteCategory
    }), [addCategory, categories, deleteCategory, editCategory])
}

type CategoriesContextType = ReturnType<typeof useCategoriesValue>;
const CategoriesContext = createContext<CategoriesContextType>({} as CategoriesContextType);

const CategoriesProvider = ({ children }: ChildrenProp) => {
    const value = useCategoriesValue();

    return (
        <CategoriesContext.Provider value={value}>
            {children}
        </CategoriesContext.Provider>
    )
}

const useCategories = () => useContext(CategoriesContext);
export { CategoriesProvider, useCategories };