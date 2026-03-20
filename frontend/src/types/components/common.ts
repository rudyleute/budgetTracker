import {AllowedNPagResClient, AllowedPagResClient, AllowedResClient} from "./mappings";

interface GetResClient<T extends AllowedResClient> {
    data: T[]
}
export interface GetNPagResClient<T extends AllowedNPagResClient> extends GetResClient<T> {
    data: T[]
}

export interface GetPagResClient<T extends AllowedPagResClient> extends GetResClient<T> {
    isLastPage: boolean;
    total: number;
}

export interface PaginatedRes<T extends AllowedPagResClient> extends Omit<GetPagResClient<T>, 'is_last_page'>{
    total: number;
}