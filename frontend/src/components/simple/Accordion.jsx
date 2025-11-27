import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';

const Accordion = ({ hClassName, className, bClassName, label, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={twMerge("w-full", className)}>
      <div className="w-full overflow-hidden rounded-[10px]">
        <div className={twMerge("relative flex items-center pl-[20px]", hClassName)}>
          <span className="w-full text-clipped inline-block pr-[45px]">{label}</span>
          <FontAwesomeIcon
            className="end-adornment cursor-pointer max-sml:icon-s"
            onClick={() => setIsOpen(prev => !prev)}
            icon={isOpen ? faCaretUp : faCaretDown}
            size={"lg"}
          />
        </div>

        <div className={twMerge(
          "grid transition-500 overflow-hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}>
          <div
            className={twMerge("p-[5px_10px] transition-500", bClassName, "overflow-hidden", !isOpen && "p-0")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Accordion);