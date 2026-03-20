import DOMPurify from 'dompurify';
import {zodResolver} from '@hookform/resolvers/zod';
import _ from 'lodash';
import {AllowedField} from "@app/shared";
import {z} from "zod";
import {FieldNamesMarkedBoolean, FieldValues, Resolver, ResolverResult, UseFormTrigger} from "react-hook-form";
import {FormRef, RequestQueryType} from "../types/basic";
import {AllowedResClient} from "../types/components/mappings";

type Key<T extends z.ZodType<AllowedResClient>> = AllowedField<T> | (string & {});
interface GroupByType<T extends z.ZodType<AllowedResClient>> {
    data: z.infer<T>[];
    columnName: AllowedField<T>;
    getKey?: (value: z.infer<T>[AllowedField<T>]) => string;
}
interface GroupByReturnType<T extends z.ZodType<AllowedResClient>> {
    keys: Key<T>[];
    groups: Map<Key<T>, z.infer<T>[]>;
}
export const groupBy = <T extends z.ZodType<AllowedResClient>>({
                                                                      data,
                                                                      columnName,
                                                                      getKey = (value) => String(value)
                                                                  }: GroupByType<T>): GroupByReturnType<T> => {
    const keys: Key<T>[] = [];
    const groups = new Map<Key<T>, z.infer<T>[]>();

    data.forEach(item => {
        const newKey = getKey(item[columnName]) as Key<T>;

        if (groups.has(newKey)) {
            groups.get(newKey)!.push(item);
        } else {
            keys.push(newKey);
            groups.set(newKey, [item]);
        }
    });

    return {keys, groups};
};

type Sanitizable = string | number | boolean | Sanitizable[] | { [key: string]: Sanitizable };
const sanitizeData = <T extends Sanitizable>(value: T): T => {
    if (typeof value === "string") return DOMPurify.sanitize(value) as T;
    if (Array.isArray(value)) return value.map(sanitizeData) as T;

    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]: [string, Sanitizable]) => [k, sanitizeData(v)])
        ) as T;
    }

    return value;
};

export const sanitizedZodResolver = <T extends z.ZodType<AllowedResClient>>(schema: T): Resolver => {
    return async (values, context, options) => {
        const sanitized = sanitizeData(values);
        return zodResolver(schema as Parameters<typeof zodResolver>[0])(sanitized, context, options) as ResolverResult<z.infer<T>>;
    }
}

export const newQueryParams = <T extends RequestQueryType>(values: Partial<T>, prev: T): T => {
    const next = {...prev};

    (Object.keys(values) as (keyof T)[]).forEach(key => {
        if (values[key] != null) next[key] = values[key]!;
    });

    return _.isEqual(prev, next) ? prev : next
};

export type ValidateFields = (
    trigger: UseFormTrigger<FieldValues>,
    values: FieldValues,
    dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<FieldValues>>>
) => Promise<null | Partial<FieldValues>>;

export const validateFields: ValidateFields = async (trigger, values, dirtyFields) => {
    const isValid = await trigger(); //validate all values
    if (!isValid) return null;

    //return only changed validated values
    return Object.keys(dirtyFields).reduce((acc, key) => {
        acc[key] = values[key];
        return acc;
    }, {} as Partial<FieldValues>);
};

export type OnSuccessFn<T> = (res: T) => Promise<void>;
export type SubmitWithId<T> = (id: string, fields: Partial<FieldValues>) => Promise<T>;
export type SubmitWithoutId<T> = (fields: Partial<FieldValues>) => Promise<T>;

export async function onFormSubmit<T>(validateFields: () => ReturnType<FormRef["getData"]>, submit: SubmitWithoutId<T>, onSuccess?: OnSuccessFn<T> | null): Promise<T | null>;
export async function onFormSubmit<T>(validateFields: () => ReturnType<FormRef["getData"]>, submit: SubmitWithId<T>, onSuccess: OnSuccessFn<T> | null, id: string): Promise<T | null>;
export async function onFormSubmit<T>(
    validateFields: () => ReturnType<FormRef["getData"]>,
    submit: SubmitWithId<T> | SubmitWithoutId<T>,
    onSuccess: OnSuccessFn<T> | null = null,
    id: string | null = null
): Promise<T | null> {
    const fields = await validateFields();

    if (_.isEmpty(fields)) return null;

    let res: T;
    if (id) res = await (submit as SubmitWithId<T>)(id, fields);
    else res = await (submit as SubmitWithoutId<T>)(fields);

    onSuccess && await onSuccess(res);
    return res;
}