import IconButton from './IconButton.jsx';
import { faCircleXmark, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

const Modal = ({ children, onClose, onSubmit, bClassName, title, zIndex }) => {
  return (createPortal(
    <div
      className={"flex flex-col font-bold text-[var(--color-text)] window-center w-full max-w-[480px] box-content h-[550px] rounded-[15px]"}
      style={{ zIndex }}>
      <div className={"p-[5px_10px] flex justify-between items-center gap-2.5 bg-[var(--color-sec)]"}>
        <span className={"uppercase text-clipped"}>{title}</span>
        <div className={"flex-shrink-0"}>
          <IconButton size={"xl"} title={"Save"} onClick={onSubmit} icon={faFloppyDisk}/>
          <IconButton size={"xl"} title={"Close"} onClick={onClose} icon={faCircleXmark}/>
        </div>
      </div>
      <div className={twMerge("grow bg-[var(--color-main)] p-[15px_25px] s-scroll s-scroll-alt-color overflow-x-hidden overflow-y-auto", bClassName)}>
        {children}
      </div>
    </div>, document.body))
}

export default Modal;