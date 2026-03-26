import {ReactNode} from "react";
import {LoansRequestQuery, TransactionsRequestQuery} from "@app/shared";
import {ValidateFields} from "../helpers/utils";
import {FieldError, FieldErrorsImpl, Merge} from "react-hook-form";
import {CounterpartiesRequestQueryClient} from "../context/CounterpartiesProvider";

export interface ChildrenProp {
    children?: ReactNode | null
}

export interface FormRef {
    getData: ValidateFields
}

export interface ErrorDetails {
    status: number | null;
    statusText: string | null;
    message: string;
    errorData: unknown;
}

export interface ApiResponse<T> {
    data: T | null;
    message: string;
    status: number | null;
    statusText: string | null;
}

export type RequestQueryType = TransactionsRequestQuery | LoansRequestQuery | CounterpartiesRequestQueryClient;
export type AnyFieldError = FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;