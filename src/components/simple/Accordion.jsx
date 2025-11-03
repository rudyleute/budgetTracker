import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const Accordion = ({ hClassName, bClassName, label, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full overflow-hidden rounded-[10px]">
      <div className={twMerge("relative flex items-center pl-[20px] font-bold bg-white", hClassName)}>
        <span className="w-full text-clipped inline-block pr-[45px]">{label}</span>
        <FontAwesomeIcon
          className="end-adornment cursor-pointer"
          onClick={() => setIsOpen(prev => !prev)}
          icon={isOpen ? faCaretUp : faCaretDown}
        />
      </div>

      <div className={twMerge(
        "grid transition-all duration-500 ease-in-out overflow-hidden bg-gray-400 p-[5px_10px]",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0", bClassName, !isOpen && "p-0"
      )}>
        <div className={"overflow-hidden"}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Accordion;