import { createContext, useContext, useMemo } from 'react';
import usePagRes from '../hooks/usePaginatedResource.js';
import {CounterpartiesRequestQuery} from "@app/shared";
import {ChildrenProp} from "../types/basic";

export type CounterpartiesRequestQueryClient = Pick<CounterpartiesRequestQuery, 'filter'>;
const defaultQueryParams: CounterpartiesRequestQueryClient = {
    filter: ""
};

const CounterpartiesContext = createContext({});
const CounterpartiesProvider = ({ children }: ChildrenProp) => {
    const {
        items: counterparties,
        queryParams: counterpartiesQueryParams,
        addItem: addCounterparty,
        editItem: editCounterparty,
        deleteItem: deleteCounterparty,
        getNextPage: getNextCounterpartiesPage,
        updateQueryParams: updateCounterpartiesQueryParams,
        resetQueryParams: resetCounterpartiesQueryParams,
        GetLoader: CounterpartiesGetLoader,
        ChangeLoader: CounterpartiesChangeLoader
    } = usePagRes<'counterparty', CounterpartiesRequestQueryClient>({
        endpoint: "/counterparties",
        defaultQueryParams,
        entityName: 'counterparty'
    });

    const value = useMemo(() => ({
        counterparties,
        counterpartiesQueryParams,
        addCounterparty,
        editCounterparty,
        deleteCounterparty,
        getNextCounterpartiesPage,
        updateCounterpartiesQueryParams,
        resetCounterpartiesQueryParams,
        CounterpartiesGetLoader,
        CounterpartiesChangeLoader
    }), [CounterpartiesChangeLoader, CounterpartiesGetLoader, addCounterparty, deleteCounterparty, editCounterparty, getNextCounterpartiesPage, counterparties, counterpartiesQueryParams, resetCounterpartiesQueryParams, updateCounterpartiesQueryParams])

    return (<CounterpartiesContext.Provider value={value}>
        {children}
    </CounterpartiesContext.Provider>);
}

const useCounterparties = () => useContext(CounterpartiesContext);
export { useCounterparties, CounterpartiesProvider }