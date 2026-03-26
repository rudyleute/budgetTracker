import {RequestQueryType} from "./basic";
import {PagEntityGet, PagEntityKey, PagEntityName, PagEntityPatch, PagEntityPost} from "./components/mappings";
import {PaginatedRes} from "./components/common";
import useLoader from "../hooks/useLoader";

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

export interface UsePagRes <E extends PagEntityName, T extends RequestQueryType> {
    items: PaginatedRes<PagEntityGet<E>>,
    queryParams: NonNullable<PaginatedResource<T>["defaultQueryParams"]>,
    addItem: AddItem<E>,
    editItem: EditItem<E>,
    deleteItem: DeleteItem,
    getNextPage: GetNextPage,
    updateQueryParams: UpdateQueryParams<T>,
    resetQueryParams: ResetQueryParams<T>,
    fetchItemsFromStart: FetchItemsFromStart,
    GetLoader: ReturnType<typeof useLoader>["LoaderElem"],
    ChangeLoader: ReturnType<typeof useLoader>["LoaderElem"],
    showGetLoader: ReturnType<typeof useLoader>["showLoader"],
    showChangeLoader: ReturnType<typeof useLoader>["showLoader"],
    hideGetLoader: ReturnType<typeof useLoader>["hideLoader"],
    hideChangeLoader: ReturnType<typeof useLoader>["hideLoader"],
    total: number
}