import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import ConfirmationDialog from '../components/simple/ConfirmationDialog.jsx';
import {ChildrenProp} from "../types/basic";
import React from "react";
import {ConfirmationState} from "../types/components/confirmation";

const defaultState: ConfirmationState = {
    isShown: false,
    onAccept: () => Promise.resolve(),
    onReject: () => {},
    text: null
};

interface ConfirmationContextType {
    showConfirmation: (value: Omit<ConfirmationState, 'isShown' | 'onReject'> & { onReject?: ConfirmationState['onReject'] }) => void; //partial onReject
}

const ConfirmationContext = createContext<ConfirmationContextType>({} as ConfirmationContextType);
const ConfirmationProvider = ({children}: ChildrenProp) => {
    const [data, setData] = useState(defaultState);

    const onAcceptAct = async () => {
        if (data.onAccept) await data.onAccept();
        setData(defaultState);
    }

    const onRejectAct = () => {
        if (data.onReject) data.onReject();
        setData(defaultState);
    }

    const showConfirmation: ConfirmationContextType["showConfirmation"] = useCallback(({
                                                                                           onAccept,
                                                                                           text,
                                                                                           onReject = defaultState.onReject
                                                                                       }) => {
        setData({
            isShown: true,
            onAccept,
            onReject,
            text
        });
    }, []);

    const value = useMemo(() => ({showConfirmation}), [showConfirmation])

    return (
        <ConfirmationContext.Provider value={value}>
            {children}
            {data.isShown &&
              <>
                <ConfirmationDialog onReject={onRejectAct} onAccept={onAcceptAct} text={data.text}/>
                <div className={"overlay z-2999"}/>
              </>}
        </ConfirmationContext.Provider>
    )
}

const useConfirmation = () => useContext(ConfirmationContext);
export {ConfirmationProvider, useConfirmation};