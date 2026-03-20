import api from './axios';
import {toast} from 'react-toastify';
import {formToast} from '../helpers/toast';
import {RequestQueryType} from "../types/basic";
import {PaginatedRes} from "../types/components/common";
import {AllowedPagResClient} from "../types/components/mappings";

/**
 * GET request handler
 *
 * @param {String} endpoint
 * @param {Object} queryParams - query parameters for GET request
 * @param {Number} offset
 * @param {Number} limit
 * @returns {Promise<Object|null>}
 */
export const fetchHandler = async <T extends AllowedPagResClient>(
    endpoint: string, queryParams: RequestQueryType, offset: number = 0, limit: number = 0
): Promise<PaginatedRes<T> | null> => {
    const {data: res, message} = await api.getPaginated<T>(endpoint, {...queryParams, offset, limit});

    if (!res) {
        toast.error(formToast(message));
        return null;
    }

    return { data: res.data, total: res.data.length, isLastPage: res.isLastPage };
}