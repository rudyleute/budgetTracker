import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import _ from 'lodash';
import api from '../services/axios.js';
import { fetchHandler } from '../services/api.js';
import { formToast, formToastMain } from '../helpers/toast.jsx';
import { newQueryParams } from '../helpers/utils.js';
import useLoader from './useLoader';
import { ScaleLoader, SyncLoader } from 'react-spinners';
import {RequestQueryType} from "../types/basic";
import {PaginatedRes} from "../types/components/common";
import {
    AllowedPagResClient,
    PagEntityGet,
    PagEntityKey,
    PagEntityName,
    PagEntityPatch,
    PagEntityPost
} from "../types/components/mappings";
import {
    AddItem, DeleteItem,
    EditItem,
    FetchItemsFromStart, GetNextPage,
    PaginatedResource,
    ResetQueryParams,
    UpdateQueryParams
} from "../types/usePagRes";

const getDefaultValue =  <T extends AllowedPagResClient>(): PaginatedRes<T> => ({ data: [], total: 0, isLastPage: true });
const emptyObject: Readonly<RequestQueryType> = {};
export const usePagRes = <E extends PagEntityName, T extends RequestQueryType>({
                                         endpoint,
                                         defaultQueryParams = emptyObject as T,
                                         entityName,
                                         offset = 0,
                                         limit = 0,
                                         skipInitFetch = false
                                     }: PaginatedResource<T>) => {

    const [items, setItems] = useState<PaginatedRes<PagEntityGet<E>>>(getDefaultValue<PagEntityGet<E>>());
    const [queryParams, setQueryParams] = useState<NonNullable<PaginatedResource<T>["defaultQueryParams"]>>(defaultQueryParams);
    const isInitFetch = useRef(true);
    const {
        showLoader: showGetLoader,
        hideLoader: hideGetLoader,
        LoaderElem: GetLoader
    } = useLoader({ color: "var(--color-sec)", global: false, LoaderComp: ScaleLoader });
    const {
        showLoader: showChangeLoader,
        hideLoader: hideChangeLoader,
        LoaderElem: ChangeLoader
    } = useLoader({ color: "var(--color-sec)", LoaderComp: SyncLoader })

    const fetchItemsFromStart: FetchItemsFromStart = useCallback(async (newLimit = limit) => {
        const res = await fetchHandler<PagEntityGet<E>>(endpoint, queryParams, offset, newLimit);

        if (res === null) return false;

        setItems(res);
        return true;
    }, [endpoint, limit, offset, queryParams]);

    useEffect(() => {
        if (skipInitFetch && isInitFetch.current) {
            isInitFetch.current = false;
            return;
        }

        (async () => {
            showGetLoader();
            if (!await fetchItemsFromStart()) setItems(getDefaultValue<PagEntityGet<E>>());
            hideGetLoader();
        })();
    }, [fetchItemsFromStart, hideGetLoader, showGetLoader, skipInitFetch]);

    const updateQueryParams: UpdateQueryParams<T> = useCallback((values) => {
        //prev is returned and new requests are not made if none of the fields' values were changed
        setQueryParams(prev => newQueryParams(values, prev));
    }, [defaultQueryParams]);

    const resetQueryParams: ResetQueryParams<T> = useCallback((params = [], ignore = []) => {
        setQueryParams(prev => {
            let nParams = Array.isArray(params) ? params : [params];
            const nIgnore = Array.isArray(ignore) ? ignore : [ignore];

            if (nParams.length === 0) {
                //if no keys have been provided, reset all of them
                if (nIgnore.length === 0) return _.isEqual(prev, defaultQueryParams) ? prev : defaultQueryParams;

                //reset all the fields in the query apart from the ones that were requested to be ignored
                const next = { ...prev };
                (Object.keys(defaultQueryParams) as (keyof T)[]).forEach((key) => {
                    if (!nIgnore.includes(key)) next[key] = defaultQueryParams[key];
                });

                return _.isEqual(prev, next) ? prev : next;
            }

            //ensure that ignored query params are not in params
            const resetParams = nParams.filter(elem => !nIgnore.includes(elem))

            const next = { ...prev };
            resetParams.forEach((key) => {
                if (key in defaultQueryParams) next[key] = defaultQueryParams[key];
            });
            return _.isEqual(prev, next) ? prev : next;
        });
    }, [defaultQueryParams]);

    const addItem: AddItem<E> = useCallback(async (data: PagEntityPost<E>, timeColName: PagEntityKey<E> = "createdAt") => {
        showChangeLoader();

        const { data: newItem, message } = await api.post<PagEntityGet<E>>(endpoint, data);
        if (!newItem) {
            toast.error(formToast(message));
            hideChangeLoader();
            return null;
        }

        toast.success(formToastMain(entityName, newItem.name, newItem[timeColName] as string, "created"));
        const res = await fetchItemsFromStart(items.total + 1);

        hideChangeLoader();
        if (!res) return null;

        return newItem;
    }, [endpoint, entityName, fetchItemsFromStart, hideChangeLoader, items.total, showChangeLoader]);

    const editItem: EditItem<E> = useCallback(async (id: string, data: PagEntityPatch<E>, timeColName: PagEntityKey<E> = "createdAt") => {
        showChangeLoader();
        const { data: updatedItem, message } = await api.patch<PagEntityGet<E>>(`${endpoint}/${id}`, data);

        if (!updatedItem) {
            toast.error(formToast(message));
            hideChangeLoader();
            return null;
        }

        toast.success(formToastMain(entityName, updatedItem.name, updatedItem[timeColName] as string, "edited"));

        const res = await fetchItemsFromStart(items.total);
        hideChangeLoader();

        if (!res) return null;
        return updatedItem;
    }, [endpoint, entityName, fetchItemsFromStart, hideChangeLoader, items.total, showChangeLoader]);

    const deleteItem: DeleteItem = useCallback(async (id: string) => {
        showChangeLoader();

        const { status, message } = await api.delete(`${endpoint}/${id}`);
        if (status !== 204) {
            toast.error(formToast(message));
            hideChangeLoader();
            return false;
        }

        toast.success(formToast("Successfully deleted"));

        const res = await fetchItemsFromStart(items.total - 1);
        hideChangeLoader();

        return res;
    }, [endpoint, fetchItemsFromStart, hideChangeLoader, items.total, showChangeLoader]);

    const getNextPage: GetNextPage = useCallback(async () => {
        showGetLoader();
        const res = await fetchHandler<PagEntityGet<E>>(endpoint, queryParams, items.total);
        hideGetLoader();

        if (!res) return false;

        const { data: newItems, total, isLastPage } = res;
        setItems(prev => ({
            data: prev.data.concat(newItems),
            total: prev.total + total,
            isLastPage: isLastPage
        }));

        return true;
    }, [showGetLoader, endpoint, queryParams, items.total, hideGetLoader]);

    return {
        items,
        queryParams,
        GetLoader,
        ChangeLoader,
        addItem,
        editItem,
        deleteItem,
        getNextPage,
        updateQueryParams,
        resetQueryParams,
        fetchItemsFromStart,
        showGetLoader,
        showChangeLoader,
        hideGetLoader,
        hideChangeLoader,
        total: items.total
    };
};

export default usePagRes;