import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { twMerge } from 'tailwind-merge';

const Select = ({ options, onOptionClick, className }) => {
  const [curValue, setCurValue] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const defaultOption = options.find(option => option.isDefault)
    if (defaultOption) setCurValue(defaultOption)
    else if (options.length > 0) setCurValue(options[0]);

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
      <div className={"field relative mb-[1px]"}>
        <span className={"w-full text-clipped inline-block pr-[45px]"}>{curValue.label}</span>
        <FontAwesomeIcon className={"end-adornment"} onClick={() => setIsOpen(prev => !prev)}
                         icon={isOpen ? faAngleUp : faAngleDown}/>
      </div>
      {isOpen && <div
        className={"w-full rounded-[15px] pr-0 text-xl max-h-[200px] overflow-hidden bg-white absolute top-full left-0 z-10 shadow-[0_10px_25px_rgba(0,0,0,0.3)]"}>
        <ul className={"s-scroll max-h-[200px] h-full overflow-y-auto"}>
          {options?.map((elem, ind) => <li key={ind}
                                           className={"hover:cursor-pointer bg-white hover:bg-[#640D5F]/40 w-full text-left text-clipped p-[5px_10px]"}
                                           onClick={() => {
                                             setIsOpen(false)
                                             setCurValue(elem)
                                             onOptionClick(elem)
                                           }}>{elem.label}</li>)}
        </ul>
      </div>}
    </div>
  )
}

export default Select;