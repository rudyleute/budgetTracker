import {Request} from 'express';

export const isBody = (body: Request["body"]): body is Record<string, unknown> => {
    return !!body && typeof body === 'object' && !Array.isArray(body);
};