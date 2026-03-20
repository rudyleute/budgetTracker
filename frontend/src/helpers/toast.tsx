import React, {ReactNode} from "react";
import {DateInput, formatTimestamp} from './time.js';

export const formToast = (children: ReactNode) => {
    return (<span className={"text-xs text-black"}>
    {children}
  </span>)
}

export const formToastMain = (entity: string, name: string, timestamp: DateInput, action: string) => {
    return formToast(<>
        <span className={"capitalize"}>{entity}</span> <b>"{name}"</b>
        <> created at <b>{formatTimestamp(timestamp, {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            year: 'numeric',
            day: '2-digit'
        })}</b>
        </>
        <> has been successfully {action}!</>
    </>);
}