import React, { useState, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import Input from './Input.jsx';

const Autocomplete = ({
                        options,
                        id,
                        onChange,
                        onOptionClick,
                        optionLabelColumn,
                        className,
                        label,
                        lClassName,
                        error,
                        ...rest
                      }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
    }
  }, [])

  return (
    <div className={twMerge("field-wrapper", className)}>
      {label && <label htmlFor={id} className={twMerge("label", lClassName)}>{label}</label>}
      <div ref={wrapperRef} className={"input-wrapper h-full"}>
        <Input ref={inputRef} id={id} {...rest} onChange={e => onChange(e.target.value)}
               onFocus={() => setIsOpen(true)}
               />
        {isOpen && <div
          className={"w-full text-[var(--color-input-text)] rounded-[15px] pr-0 text-xl max-h-[200px] overflow-hidden bg-[var(--color-text)] absolute top-full left-0 z-10 shadow-[0_10px_25px_rgba(0,0,0,0.3)]"}>
          <ul className={"s-scroll s-scroll-alt-color max-h-[200px] h-full overflow-y-auto"}>
            {
              options?.map((elem) => <li key={elem.id}
                                         className={"hover:cursor-pointer bg-[var(--color-text)] hover:bg-[var(--color-third)]/70 hover:font-bold w-full text-left text-clipped p-[5px_10px]"}
                                         onMouseDown={(e) => e.preventDefault()} //Blur is executed before onClick, so without this line onClick on options will never be executed
                                         onClick={() => {
                                           setIsOpen(false)
                                           inputRef.current?.blur();
                                           onOptionClick(elem)
                                         }}>{elem[optionLabelColumn]}</li>)
            }
          </ul>
        </div>}
      </div>
      {error && <span className={"max-modal:text-xl modal:text-xs text-[var(--color-error)]"}>{error}</span>}
    </div>
  )
}

export default React.memo(Autocomplete);