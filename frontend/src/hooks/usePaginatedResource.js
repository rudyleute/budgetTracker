import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import _ from 'lodash';
import api from '../services/axios.js';
import { fetchHandler } from '../services/api.js';
import { formToast, formToastMain } from '../helpers/toast.jsx';
import { newQueryParams } from '../helpers/utils.js';
import useLoader from './useLoader.jsx';
import { ScaleLoader, SyncLoader } from 'react-spinners';

const defaultValue = { data: [], total: 0, isLastPage: true };
/**
 * Generic hook for paginated resources with CRUD operations
 * @param {String} endpoint - API endpoint (e.g., '/transactions', '/loans')
 * @param {Object} defaultQueryParams - Default query parameters
 * @param {String} entityName - Name for toast messages (e.g., 'transaction', 'loan')
 * @param {Number} offset
 * @param {Number} limit - Backend-predefined limit if 0, no limit if negative
 * @param {Boolean} skipInitFetch - if set to true, the initial fetching on mount is not performed
 */
const emptyObject = {}
export const usePaginatedResource = ({
                                       endpoint,
                                       defaultQueryParams = emptyObject,
                                       entityName = 'item',
                                       offset = 0,
                                       limit = 0,
                                       skipInitFetch = false
                                     }) => {
  const [items, setItems] = useState(defaultValue);
  const [queryParams, setQueryParams] = useState(defaultQueryParams);
  const isInitFetch = useRef(true);
  const {
    showLoader: showGetLoader,
    hideLoader: hideGetLoader,
    LoaderElement: GetLoader
  } = useLoader({ color: "var(--color-sec)", global: false, LoaderComp: ScaleLoader });
  const {
    showLoader: showChangeLoader,
    hideLoader: hideChangeLoader,
    LoaderElement: ChangeLoader
  } = useLoader({ color: "var(--color-sec)", LoaderComp: SyncLoader })

  const fetchItemsFromStart = useCallback(async (newLimit = limit) => {
    const res = await fetchHandler(endpoint, queryParams, offset, newLimit);

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
      if (!await fetchItemsFromStart()) setItems(defaultValue);
      hideGetLoader();
    })();
  }, [fetchItemsFromStart, hideGetLoader, showGetLoader, skipInitFetch]);

  const updateQueryParams = useCallback((values) => {
    //prev is returned and new requests are not made if none of the fields' values were changed
    setQueryParams(prev => newQueryParams(values, prev, Object.keys(defaultQueryParams)));
  }, [defaultQueryParams]);

  const resetQueryParams = useCallback((params = [], ignore = []) => {
    setQueryParams(prev => {
      let nParams = typeof params === "string" ? [params] : params;
      const nIgnore = typeof ignore === "string" ? [ignore] : ignore
      
      if (nParams.length === 0) {
        //if no keys have been provided, reset all of them
        if (nIgnore.length === 0) return _.isEqual(prev, defaultQueryParams) ? prev : defaultQueryParams;

        //reset all the fields in the query apart from the ones that were requested to be ignored
        const next = { ...prev };
        Object.keys(defaultQueryParams).forEach((key) => {
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

  const addItem = useCallback(async (data, timeColName = "timestamp") => {
    showChangeLoader();

    const { data: newItem, message } = await api.post(endpoint, data);
    if (!newItem) {
      toast.error(formToast(message));
      hideChangeLoader();
      return null;
    }

    toast.success(formToastMain(entityName, newItem.name, newItem[timeColName], "created"));
    const res = await fetchItemsFromStart(items.total + 1);

    hideChangeLoader();
    if (!res) return null;

    return newItem;
  }, [endpoint, entityName, fetchItemsFromStart, hideChangeLoader, items.total, showChangeLoader]);

  const editItem = useCallback(async (id, data, timeColName = "timestamp") => {
    showChangeLoader();
    const { data: updatedItem, message } = await api.patch(`${endpoint}/${id}`, data);

    if (!updatedItem) {
      toast.error(formToast(message));
      hideChangeLoader();
      return null;
    }

    toast.success(formToastMain(entityName, updatedItem.name, updatedItem[timeColName], "edited"));

    const res = await fetchItemsFromStart(items.total);
    hideChangeLoader();

    if (!res) return null;
    return updatedItem;
  }, [endpoint, entityName, fetchItemsFromStart, hideChangeLoader, items.total, showChangeLoader]);

  const deleteItem = useCallback(async (id) => {
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

  const getNextPage = useCallback(async () => {
    showGetLoader();
    const res = await fetchHandler(endpoint, queryParams, items.total);
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

export default usePaginatedResource;