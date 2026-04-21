import { twMerge } from 'tailwind-merge';
import Asterisk from './Asterisk';
import {ReactNode, TextareaHTMLAttributes} from "react";
import {AnyFieldError} from "../../types/basic";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    lClassName?: string,
    wClassName?: string,
    label?: ReactNode,
    required?: boolean,
    error?: AnyFieldError
}
const Textarea = ({ label, className, lClassName, required, wClassName, value, error, ...rest }: TextareaProps) => {
    const errorMessage = typeof error?.message === 'string' ? error.message : undefined;

    return (
        <div className={twMerge("field-wrapper", wClassName)}>
            {label && <label className={twMerge("label", lClassName)} htmlFor={rest.id}>{label}{required && <Asterisk />}</label>}
            <div className={"input-wrapper h-fit!"}>
        <textarea
            className={twMerge(`field pr-5! font-bold s-scroll s-scroll-alt-color`, rest.rows && 'h-auto!', className)} {...rest} >
          {value}
        </textarea>
            </div>
            {errorMessage && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{errorMessage}</span>}
        </div>);
}

export default Textarea;