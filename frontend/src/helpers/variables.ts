import {PriorityTypes} from "@app/shared";

export const priorityColorMap = {
    [PriorityTypes["low"]]: "blue",
    [PriorityTypes["medium"]]: "yellow",
    [PriorityTypes["high"]]: "red"
} as const satisfies Record<PriorityTypes, string>;

export const authStatuses = {
    anon: "ANON",
    loggedUnverified: "AUTHED_UNVERIFIED",
    loggedVerified: "AUTHED_VERIFIED"
} as const;

export type PriorityColor = typeof priorityColorMap[keyof typeof priorityColorMap];
export type AuthStatus = typeof authStatuses[keyof typeof authStatuses];