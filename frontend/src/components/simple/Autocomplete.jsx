import React, { useState, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import Input from './Input.jsx';
import Asterisk from './Asterisk.jsx';

const Autocomplete = ({
                        options,
                        onChange,
                        onOptionClick,
                        optionLabelColumn,
                        className,
                        label,
                        lClassName,
                        iClassName,
                        required,
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
      {label &&
        <label htmlFor={rest.id} className={twMerge("label", lClassName)}>{label}{required && <Asterisk/>}</label>}
      <div ref={wrapperRef} className={"input-wrapper h-full"}>
        <Input className={iClassName} ref={inputRef} onChange={e => onChange(e.target.value)}
               onFocus={() => setIsOpen(true)} {...rest}
        />
        {isOpen && <div
          className={"w-full text-(--color-input-text) rounded-[15px] pr-0 text-xl max-h-[200px] overflow-hidden bg-(--color-text) absolute top-full left-0 z-10 shadow-[0_10px_25px_rgba(0,0,0,0.3)"}>
          <ul className={"s-scroll s-scroll-alt-color max-h-[200px] h-full overflow-y-auto"}>
            {
              options?.map((elem) => <li key={elem.id}
                                         className={"hover:cursor-pointer bg-(--color-text) hover:bg-(--color-third)/70 hover:font-bold w-full text-left text-clipped p-[5px_10px]"}
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
      {error && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{error}</span>}
    </div>
  )
}

export default React.memo(Autocomplete);