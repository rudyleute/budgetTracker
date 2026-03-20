import React, {ReactNode} from "react";
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {GridLoader, ScaleLoader, SyncLoader} from 'react-spinners';
import { twMerge } from 'tailwind-merge';
import {LengthType} from "react-spinners/helpers/props";
import {ChildrenProp} from "../types/basic";

interface LoaderState {
    loading: boolean;
    message: string;
}

interface UseLoader {
    color?: string,
    overlayColor?: string,
    size?: LengthType,
    LoaderComp?: typeof GridLoader | typeof SyncLoader | typeof ScaleLoader,
    global?: boolean,
    isLoading?: boolean
}

export type ShowLoader = (message?: string) => void;
export type HideLoader = () => void;
export type LoaderElemType = (value: ChildrenProp) => ReactNode;

const defaultState: LoaderState = {
    loading: false,
    message: ""
};
const useLoader = ({
                       color = "var(--color-third)",
                       overlayColor = "",
                       size = 30,
                       LoaderComp = GridLoader,
                       global = true,
                       isLoading = false
                   }: UseLoader = {}) => {
    const [loader, setLoader] = useState({loading: isLoading, message: defaultState.message});

    const showLoader: ShowLoader = useCallback((message = "") => {
        setLoader({
            loading: true,
            message
        })
    }, []);

    const hideLoader: HideLoader = useCallback(() => setLoader(defaultState), []);

    const LoaderElem: LoaderElemType = ({children}) => {
        if (!loader.loading) return <>{children}</>;

        return global ? createPortal(<div
                className={twMerge("fixed gap-[15px] overlay z-4000 flex flex-col justify-center items-center", `${overlayColor && '!'}${overlayColor}`)}>
                <LoaderComp size={size} color={color}/>
                {loader.message && (
                    <span className="text-(--color-main) font-bold">
            {loader.message}
          </span>
                )}
            </div>, document.body) :
            <span>
        <LoaderComp size={size} color={color}/>
      </span>;
    };

    return {
        showLoader,
        hideLoader,
        LoaderElem
    };
}


export default useLoader;