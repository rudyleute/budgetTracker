import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { twMerge } from 'tailwind-merge';

const Select = ({ curValue, options, onOptionClick, className, label, lClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

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
    <div ref={wrapperRef} className={twMerge("field-wrapper relative", className)}>
      {label && <label className={twMerge("label", lClassName)}>{label}</label>}
      <div className={"field relative mb-[1px] bg-[var(--color-text)]"}>
        <span className={"w-full text-clipped inline-block pr-[45px]"}>{curValue}</span>
        <FontAwesomeIcon className={"end-adornment"} onClick={() => setIsOpen(prev => !prev)}
                         icon={isOpen ? faAngleUp : faAngleDown}/>
      </div>
      {isOpen && <div
        className={"w-full text-[var(--color-input-text)] rounded-[15px] pr-0 text-xl max-h-[200px] overflow-hidden bg-[var(--color-text)] absolute top-full left-0 z-10 shadow-[0_10px_25px_rgba(0,0,0,0.3)]"}>
        <ul className={"s-scroll max-h-[200px] h-full overflow-y-auto"}>
          {options?.map((elem, ind) => <li key={ind}
                                           className={"hover:cursor-pointer bg-[var(--color-text)] hover:bg-[var(--color-third)]/70 hover:font-bold w-full text-left text-clipped p-[5px_10px]"}
                                           onClick={() => {
                                             setIsOpen(false)
                                             if (elem.func) elem.func()
                                             onOptionClick && onOptionClick(elem)
                                           }}>{elem.label}</li>)}
        </ul>
      </div>}
    </div>
  )
}

export default React.memo(Select);