import 'dotenv/config';

import morgan from 'morgan';
import logger from './utils/logger';
import cors from 'cors';
import { corsOptions } from './utils/middleware';
import {DecodedIdToken} from "firebase-admin/auth";
import {Response, Request, NextFunction} from "express";
import express from 'express';
import {authenticateUser} from "./utils/middleware";
import {CounterpartiesController} from "./controllers/counterparties";
import db from "./utils/db";
import {CategoriesController} from "./controllers/categories";
import {LoansController} from "./controllers/loans";
import {UsersController} from "./controllers/users";
import {TransactionsController} from "./controllers/transactions";
import {CustomError} from "@app/shared";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: DecodedIdToken
        }
    }
}

const morganStream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};

const app = express();

app.use(cors(corsOptions));
app.use(morgan('combined', { stream: morganStream }));
app.use(express.json());

const apiRouter = express.Router();
apiRouter.use(authenticateUser);
apiRouter.use("/users", (new UsersController(db, logger)).getRouters());
apiRouter.use("/transactions", (new TransactionsController(db, logger)).getRouters());
apiRouter.use("/categories", (new CategoriesController(db, logger)).getRouters());
apiRouter.use("/loans", (new LoansController(db, logger)).getRouters());
apiRouter.use("/counterparties", (new CounterpartiesController(db, logger)).getRouters());

app.use('/api', apiRouter);
app.use((_req: Request, res: Response<CustomError>) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response<CustomError>, _next: NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
        logger.warn('CORS error', {
            origin: req.headers.origin,
            path: req.path
        });
        res.status(403).json({ message: 'Origin not allowed' });
    }

    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(process.env.PORT, () => logger.info(`Server running on port ${process.env.PORT}`));