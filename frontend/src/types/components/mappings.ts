import {
    CategoryGetServer, CategoryPatchServer, CategoryPostServer,
    CounterpartyGetServer, CounterpartyPatchServer, CounterpartyPostServer,
    LoanGetServer, LoanPatchServer, LoanPostServer,
    TransactionGetServer, TransactionPatchServer, TransactionPostServer,
    UserGetServer, UserPostServer
} from "@app/shared";

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
    ? `${P}${Capitalize<CamelCase<Q>>}` : S;

type CamelizeKeys<T> = T extends Array<infer U>
    ? CamelizeKeys<U>[]
    : T extends Date
        ? T
        : T extends object
            ? { [K in keyof T as CamelCase<string & K>]: CamelizeKeys<T[K]> }
            : T;


export type CategoryGetClient = CamelizeKeys<CategoryGetServer>;
export type TransactionGetClient = CamelizeKeys<TransactionGetServer>;
export type UserGetClient = CamelizeKeys<UserGetServer>;
export type LoanGetClient = CamelizeKeys<LoanGetServer>;
export type CounterpartyGetClient = CamelizeKeys<CounterpartyGetServer>;

export type TransactionPostClient = CamelizeKeys<TransactionPostServer>;
export type LoanPostClient = CamelizeKeys<LoanPostServer>;
export type CounterpartyPostClient = CamelizeKeys<CounterpartyPostServer>;
export type CategoryPostClient = CamelizeKeys<CategoryPostServer>;
export type UserPostClient = CamelizeKeys<UserPostServer>;

export type TransactionPatchClient = CamelizeKeys<TransactionPatchServer>;
export type LoanPatchClient = CamelizeKeys<LoanPatchServer>;
export type CounterpartyPatchClient = CamelizeKeys<CounterpartyPatchServer>;
export type CategoryPatchClient = CamelizeKeys<CategoryPatchServer>;

interface PagEntityMap {
    transaction: {
        get: TransactionGetClient,
        post: TransactionPostClient,
        patch: TransactionPatchClient
    },
    loan: {
        get: LoanGetClient,
        post: LoanPostClient,
        patch: LoanPatchClient
    },
    counterparty: {
        get: CounterpartyGetClient,
        post: CounterpartyPostClient,
        patch: CounterpartyPatchClient
    }
}

export type PagEntityName = keyof PagEntityMap;
export type PagEntityGet<K extends PagEntityName> = PagEntityMap[K]['get'];
export type PagEntityPost<K extends PagEntityName> = PagEntityMap[K]['post'];
export type PagEntityPatch<K extends PagEntityName> = PagEntityMap[K]['patch'];
export type PagEntityKey<K extends PagEntityName> = keyof PagEntityGet<K>;

export type AllowedPagResClient = CounterpartyGetClient | LoanGetClient | TransactionGetClient;
export type AllowedNPagResClient = CategoryGetClient;
export type AllowedResClient = AllowedPagResClient | AllowedNPagResClient;