import React, {useState, useRef, useEffect, ReactNode} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { twMerge } from 'tailwind-merge';
import Asterisk from './Asterisk.jsx';
import {AnyFieldError} from "../../types/basic";

export interface SelectOption<E = string> {
    label: E
    func?: () => unknown
    id: string
}

interface SelectProps<E = string> {
    error?: AnyFieldError;
    lClassName?: string;
    className?: string;
    required?: boolean;
    value: ReactNode;
    options: SelectOption<E>[];
    onOptionClick?: (elem: SelectOption<E>) => unknown,
    label?: ReactNode;
}
const Select = <E = string>({ value, options, onOptionClick, required, className, label, error, lClassName }: SelectProps<E>) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const errorMessage = typeof error?.message === 'string' ? error.message : undefined;

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (wrapperRef.current && e.target instanceof Node && !wrapperRef.current.contains(e.target)) setIsOpen(false);
        }

        document.addEventListener('mousedown', handleOutsideClick, true);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick, true);
        }
    }, [])

    return (
        <div ref={wrapperRef} className={twMerge("field-wrapper", className)}>
            {label && <label className={twMerge("label", lClassName)}>{label}{required && <Asterisk />}</label>}
            <div className={"input-wrapper"}>
                <div className={"field relative mb-px bg-(--color-text) overflow-hidden"}>
                    <div className={"text-clipped pr-[45px]"}>{value}</div>
                    <FontAwesomeIcon className={"end-adornment"} onClick={() => setIsOpen(prev => !prev)}
                                     icon={isOpen ? faAngleUp : faAngleDown}/>
                </div>
                {isOpen && <div
                  className={"w-full text-(--color-input-text) rounded-[15px] pr-0 text-xl max-h-[200px] overflow-hidden bg-(--color-text) absolute top-full left-0 z-10 shadow-[0_10px_25px_rgba(0,0,0,0.3)"}>
                  <ul className={"s-scroll s-scroll-alt-color max-h-[200px] h-full overflow-y-auto"}>
                      {options?.map((elem, ind) => <li key={elem.id ?? ind}
                                                       className={"hover:cursor-pointer bg-(--color-text) hover:bg-(--color-third)/70 hover:font-bold w-full text-left text-clipped p-[5px_10px]"}
                                                       onClick={async () => {
                                                           setIsOpen(false)
                                                           if (elem.func) await elem.func()
                                                           onOptionClick && await onOptionClick(elem)
                                                       }}>{String(elem.label)}</li>)}
                  </ul>
                </div>}
            </div>
            {errorMessage && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{errorMessage}</span>}
        </div>
    )
}

export default React.memo(Select) as typeof Select;