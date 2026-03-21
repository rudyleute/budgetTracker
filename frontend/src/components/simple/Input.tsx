import { twMerge } from 'tailwind-merge';
import Asterisk from './Asterisk';
import React, {ReactNode} from 'react';
import {AnyFieldError} from "../../types/basic";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    lClassName?: string;
    wClassName?: string;
    error?: AnyFieldError;
    endAdornment?: ReactNode;
}

const Input = ({ label, className, required, lClassName, endAdornment, wClassName, error, ...rest }: InputProps) => {
    const errorMessage = typeof error?.message === 'string' ? error.message : undefined;

    return (
        <div className={twMerge("field-wrapper", wClassName)}>
            {label && <label className={twMerge("label", lClassName)} htmlFor={rest.id}>{label}{required && <Asterisk />}</label>}
            <div className={"input-wrapper"}>
                <input
                    className={twMerge(`field ${endAdornment ? 'pr-[45px]!' : 'pr-5!'} font-bold`, className)} {...rest} />
                {endAdornment ? <span className={"end-adornment"}>{endAdornment}</span> : null}
            </div>
            {error && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{errorMessage}</span>}
        </div>);
}

export default Input;