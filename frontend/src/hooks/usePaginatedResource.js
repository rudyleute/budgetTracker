import { useCallback, useEffect, useState } from 'react';
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
 */
export const usePaginatedResource = ({
                                       endpoint,
                                       defaultQueryParams = {},
                                       entityName = 'item',
                                       offset = 0,
                                       limit = 0
                                     }) => {
  const [items, setItems] = useState(defaultValue);
  const [queryParams, setQueryParams] = useState(defaultQueryParams);
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
    (async () => {
      showGetLoader();
      if (!await fetchItemsFromStart()) setItems(defaultValue);
      hideGetLoader();
    })();
  }, [fetchItemsFromStart]);

  const updateQueryParams = useCallback((values) => {
    setQueryParams(prev => newQueryParams(values, prev, Object.keys(defaultQueryParams)));
  }, [defaultQueryParams]);

  const resetQueryParams = useCallback(() => {
    setQueryParams(prev => {
      return !_.isEqual(prev, defaultQueryParams) ? defaultQueryParams : prev;
    });
  }, [defaultQueryParams]);

  const addItem = useCallback(async (data, timeColName = "timestamp") => {
    showChangeLoader();

    const { data: newItem, message } = await api.post(endpoint, data);
    if (!newItem) {
      toast.error(formToast(message));
      return null;
    }

    toast.success(formToastMain(entityName, newItem.name, newItem[timeColName], "created"));
    const res = await fetchItemsFromStart(items.total);

    hideChangeLoader();

    return res;
  }, [endpoint, entityName, fetchItemsFromStart, items.total]);

  const editItem = useCallback(async (id, data, timeColName = "timestamp") => {
    showChangeLoader();
    const { data: updatedItem, message } = await api.patch(`${endpoint}/${id}`, data);

    if (!updatedItem) {
      toast.error(formToast(message));
      return null;
    }

    toast.success(formToastMain(entityName, updatedItem.name, updatedItem[timeColName], "edited"));

    const res = await fetchItemsFromStart(items.total);
    hideChangeLoader();

    return res;
  }, [endpoint, entityName, fetchItemsFromStart, items.total]);

  const deleteItem = useCallback(async (id) => {
    showChangeLoader();

    const { status, message } = await api.delete(`${endpoint}/${id}`);
    if (status !== 204) {
      toast.error(formToast(message));
      return false;
    }

    toast.success(formToast("Successfully deleted"));

    const res = await fetchItemsFromStart(items.total - 1);
    hideChangeLoader();

    return res;
  }, [endpoint, fetchItemsFromStart, items.total]);

  const getNextPage = useCallback(async () => {
    showGetLoader();
    const res = await fetchHandler(endpoint, queryParams, items.total);
    hideGetLoader();

    if (!res) return false;

    const {data: newItems, total, isLastPage} = res;
    setItems(prev => ({
      data: prev.data.concat(newItems),
      total: prev.total + total,
      isLastPage: isLastPage
    }));

    return true;
  }, [endpoint, queryParams, items.total]);

  return {
    items,
    queryParams,
    fetchItemsFromStart,
    GetLoader,
    ChangeLoader,
    addItem,
    editItem,
    deleteItem,
    getNextPage,
    updateQueryParams,
    resetQueryParams
  };
};

export default usePaginatedResource;