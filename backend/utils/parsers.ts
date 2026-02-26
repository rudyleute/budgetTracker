import logger from "./logger";
import {CustomError} from "../types/basic";
import {ZodError} from "zod";

export const parseError = (error: unknown, uid: string, entityName: string, actionName: string, addErrorInfo: Record<string, unknown> = {}): CustomError => {
    let errorMsg: string;
    let errorInfo: Record<string, unknown> = { uid, ...addErrorInfo };

    if (error instanceof ZodError) {
        errorMsg = `Data validation failed for ${entityName}`;
        errorInfo.data = error.issues;
    } else if (error instanceof Error) {
        errorMsg = `Failed to ${actionName} the ${entityName}`;
        errorInfo = {
            ...errorInfo,
            error: error.message,
            stack: error.stack
        };
    } else errorMsg = 'Unknown error occurred';

    logger.error(errorMsg, errorInfo);
    return { message: errorMsg };
};