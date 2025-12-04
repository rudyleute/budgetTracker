import api from './axios.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';

/**
 * GET request handler
 *
 * @param {String} endpoint
 * @param {Object} queryParams - query parameters for GET request
 * @param {Number} offset
 * @param {Number} limit
 * @returns {Promise<Object|null>}
 */
export const fetchHandler = async (endpoint, queryParams, offset = 0, limit = 0) => {
  const { data: newLoans, message } = await api.get(endpoint, { ...queryParams, offset, limit });

  if (!newLoans) {
    toast.error(formToast(message));
    return null;
  }

  return { data: newLoans.data, total: newLoans.data.length, isLastPage: newLoans.isLastPage };
}