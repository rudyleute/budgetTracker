import axios from 'axios';
import { auth } from './firebase';
import humps from 'humps';
import {ApiResponse, ErrorDetails} from "../types/basic";
import {GetNPagResClient, GetPagResClient} from "../types/components/common";
import {AllowedNPagResClient, AllowedPagResClient, AllowedResClient} from "../types/components/mappings";
import {CustomError} from "@app/shared";

const API_BASE_URL = process.env.MODE === 'production'
    ? process.env.VITE_BACKEND_URL
    : 'http://localhost:8080';

const instance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;

        if (user) {
            try {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Token retrieval failed:', error);

                return Promise.reject({
                    status: null,
                    statusText: 'Authentication Error',
                    message: 'Failed to get authentication token. Please sign in again.',
                    data: null
                });
            }
        }

        if (config.data) config.data = humps.decamelizeKeys(config.data);
        if (config.params) {
            config.params = Object.fromEntries(
                Object.entries(config.params).filter(([_, v]) => v != null && v !== "")
            );
            config.params = humps.decamelizeKeys(config.params);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        if (response.data) response.data = humps.camelizeKeys(response.data);
        return response;
    },
    (error) => {
        const errorDetails: ErrorDetails = {
            status: null,
            statusText: null,
            message: 'An unexpected error occurred',
            errorData: null
        };

        if (error.response) {
            const { status, statusText, data } = error.response;

            errorDetails.status = status;
            errorDetails.statusText = statusText || 'Error';
            errorDetails.message = data.message || getDefaultMessage(status);
        } else if (error.request) {
            errorDetails.status = 0;
            errorDetails.message = 'No response from server. Please check your connection.';
        } else {
            errorDetails.message = error.message || 'An unexpected error occurred';
            if (error.status !== undefined) {
                errorDetails.status = error.status;
                errorDetails.statusText = error.statusText;
                errorDetails.message = error.message;
                errorDetails.errorData = error.data;
            }
        }

        return errorDetails;
    }
);

const getDefaultMessage = (status: number): string => {
    const messages: Readonly<Record<number, string>> = {
        400: 'Invalid request',
        401: 'Authentication required',
        403: 'Access denied',
        404: 'Resource not found',
        409: 'Resource already exists',
        500: 'Server error occurred',
        502: 'Bad gateway',
        503: 'Service unavailable'
    };

    return messages[status] || 'An error occurred';
};

const api = {
    get: <T extends AllowedNPagResClient>(endpoint: string, params = {}): Promise<ApiResponse<GetNPagResClient<T>>> =>
        instance.get(endpoint, { params }),
    getPaginated: <T extends AllowedPagResClient>(endpoint: string, params = {}): Promise<ApiResponse<GetPagResClient<T>>> => instance.get(endpoint, { params }),
    getById: <T extends AllowedPagResClient>(endpoint: string, params = {}): Promise<ApiResponse<T>> => instance.get(endpoint, { params }),
    post: <T extends AllowedResClient>(endpoint: string, data = {}): Promise<ApiResponse<T>> => instance.post(endpoint, data),
    patch: <T extends AllowedResClient>(endpoint: string, data = {}): Promise<ApiResponse<T>> => instance.patch(endpoint, data),
    delete: (endpoint: string): Promise<ApiResponse<CustomError | void>> => instance.delete(endpoint)
};

export default api;