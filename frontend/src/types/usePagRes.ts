import {RequestQueryType} from "./basic";
import {PagEntityGet, PagEntityKey, PagEntityName, PagEntityPatch, PagEntityPost} from "./components/mappings";

type OneOrMany<T> = T | T[];
export interface PaginatedResource<T extends RequestQueryType> {
    endpoint: string;
    defaultQueryParams?: T,
    offset?: number,
    limit?: number,
    skipInitFetch?: boolean,
    entityName: PagEntityName;
}

export type AddItem<E extends PagEntityName> = (data: PagEntityPost<E>, timeColName?: PagEntityKey<E>) => Promise<PagEntityGet<E> | null>;
export type EditItem<E extends PagEntityName> = (id: string, data: PagEntityPatch<E>, timeColName?: PagEntityKey<E>) => Promise<PagEntityGet<E> | null>;
export type DeleteItem = (id: string) => Promise<boolean>;
export type GetNextPage = () => Promise<boolean>;
export type UpdateQueryParams<T extends RequestQueryType> = (values: Partial<T>) => void;
export type ResetQueryParams<T extends RequestQueryType> = (params?: OneOrMany<keyof T>, ignore?: OneOrMany<keyof T>) => void;
export type FetchItemsFromStart = (newLimit?: number) => Promise<boolean>;