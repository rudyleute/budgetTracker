import {Request} from 'express';

export const checkRequired = (key: string): string => {
    const value = process.env[key];

    if (value === undefined) throw new Error(`Missing environment variable ${key}`);
    return value;
};

export const isBody = (body: Request["body"]): body is Record<string, unknown> => {
    return !!body && typeof body === 'object' && !Array.isArray(body);
};