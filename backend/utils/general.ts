import {Request, Response} from 'express';
import {DecodedIdToken} from "firebase-admin/auth";

export const checkRequired = (key: string): string => {
    const value = process.env[key];

    if (value === undefined) throw new Error(`Missing environment variable ${key}`);
    return value;
};

export const isUser = (req: Request, res: Response): req is Request & {user: DecodedIdToken} => {
    if (!req.user) {
        res.status(401).send("Unauthorized");
        return false;
    }

    return true;
};

export const isBody = (body: Request["body"]): body is Record<string, unknown> => {
    return !!body && typeof body === 'object' && !Array.isArray(body);
};