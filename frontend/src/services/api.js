import api from './axios.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';

/**
 * GET request handler
 *
 * @param {String} endpoint
 * @param {Object} queryParams - query parameters for GET request
 * @param {Number} offset
 * @param {Boolean} pagination - use offset "pagination" with limit predefined on the backend if true, retrieve all elements if false
 * @returns {Promise<Object|null>}
 */
export const fetchHandler = async (endpoint, queryParams, offset = 0, pagination = true) => {
  const { data: newLoans, message } = await api.get(endpoint, { ...queryParams, offset, pagination });

  if (!newLoans) {
    toast.error(formToast(message));
    return null;
  }

  return { data: newLoans.data, total: newLoans.data.length, isLastPage: newLoans.isLastPage };
}