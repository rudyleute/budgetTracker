import logger from "./logger";
import {CustomError} from "../types/basic";
import {ZodError} from "zod";

export const parseError = (error: unknown, uid: string, entityName: string, actionName: string): CustomError => {
    if (error instanceof ZodError) {
        logger.error(`Data validation failed for ${entityName}`, {
            uid,
            data: error.issues
        });

        return { message: 'Data integrity error' };
    } else if (error instanceof Error) {
        logger.error(`Failed to ${actionName} the ${entityName}`, {
            error: error.message,
            stack: error.stack,
            uid
        });

        return { message: error.message };
    } else {
        logger.error('Unknown error occurred');
        return { message: 'Unknown error occurred' };
    }
};