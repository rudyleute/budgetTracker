import admin from './firebase';
import logger from './logger';

import {Response, NextFunction, Request} from 'express';
import {CustomError} from "../types/basic";
import {FirebaseAuthError} from "firebase-admin/auth";
import { CorsOptions} from "cors";

export const authenticateUser = async (req: Request, res: Response<CustomError>, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        req.user = await admin.auth().verifyIdToken(token);
        next();
    } catch (error: unknown) {
        if (error instanceof FirebaseAuthError) {
            if (error.code === "auth/id-token-expired") res.status(401).json({ message: 'Token expired' });
            else if (error.code === "auth/auth/id-token-revoked") res.status(401).json({ message: 'Token revoked' });
            else if (error.code === "auth/internal-error") res.status(500).json({ message: 'Internal error. Please try again later.' });
            else if (error.code === "auth/invalid-credential") res.status(401).json({ message: 'Can\'t process token verification'});
            else res.status(401).json({ message: `Unexpected error. Code: ${error.code}` });

            return;
        }
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
            return;
        }
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const allowedOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',') :
    ['http://localhost:3000'];

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) callback(null, true);
        else {
            logger.warn('CORS blocked request from unauthorized origin', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};