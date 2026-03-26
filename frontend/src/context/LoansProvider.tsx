import { createContext, useCallback, useContext, useMemo } from 'react';
import usePagRes from '../hooks/usePaginatedResource';
import api from '../services/axios.js';
import { toast } from 'react-toastify';
import { formToast, formToastMain } from '../helpers/toast';
import {LoanSortableKey, LoansRequestQuery, LoanTypes, PriorityTypes, SORTABLE} from "@app/shared";
import {PagEntityGet} from "../types/components/mappings";
import {ChildrenProp, RequestQueryType} from "../types/basic";
import {PaginatedResource} from "../types/usePagRes";

const defaultQueryParams: LoansRequestQuery = {
    from: "", to: "", type: "", priority: "", sort: "", order: "", counterparty: ""
};
const sortByOptions: LoanSortableKey[] = SORTABLE;
const priorities = Object.values(PriorityTypes);
const types = Object.values(LoanTypes);
const endpoint = '/loans'

type CloseLoan = (id: string) => Promise<PagEntityGet<'loan'> | null>;

type LoansProviderProps<T extends RequestQueryType> = ChildrenProp & Pick<PaginatedResource<T>, 'skipInitFetch'>;

const LoansContext = createContext({});
const LoansProvider = ({ children, skipInitFetch=false }: LoansProviderProps<LoansRequestQuery>) => {
    const {
        items: loans,
        queryParams: loansQueryParams,
        addItem: addLoan,
        editItem: editLoan,
        deleteItem: deleteLoan,
        getNextPage: getNextLoansPage,
        updateQueryParams: updateLoansQueryParams,
        resetQueryParams: resetLoansQueryParams,
        GetLoader: LoansGetLoader,
        ChangeLoader: LoansChangeLoader,
        showChangeLoader,
        hideChangeLoader,
        fetchItemsFromStart,
        total
    } = usePagRes<"loan", LoansRequestQuery>({
        endpoint,
        defaultQueryParams,
        entityName: 'loan',
        skipInitFetch
    });

    const closeLoan: CloseLoan = useCallback(async (id) => {
        showChangeLoader();
        const { data: updatedItem, message } = await api.patch<PagEntityGet<"loan">>(`${endpoint}/${id}/close`);

        if (!updatedItem) {
            toast.error(formToast(message));
            hideChangeLoader();
            return null;
        }

        toast.success(formToastMain('loan', updatedItem.name, updatedItem["timestamp"].toString(), "closed"));

        const res = await fetchItemsFromStart(total);
        hideChangeLoader();

        if (!res) return null;
        return updatedItem;
    }, [fetchItemsFromStart, hideChangeLoader, showChangeLoader, total])

    const value = useMemo(() => ({
        loans,
        loansQueryParams,
        addLoan,
        editLoan,
        deleteLoan,
        getNextLoansPage,
        updateLoansQueryParams,
        resetLoansQueryParams,
        LoansGetLoader,
        LoansChangeLoader,
        priorities,
        types,
        sortByOptions,
        closeLoan
    }), [LoansChangeLoader, LoansGetLoader, addLoan, deleteLoan, editLoan, getNextLoansPage, loans, loansQueryParams, resetLoansQueryParams, updateLoansQueryParams, closeLoan])

    return (<LoansContext.Provider value={value}>
        {children}
    </LoansContext.Provider>);
}

const useLoans = () => useContext(LoansContext);
export { useLoans, LoansProvider }