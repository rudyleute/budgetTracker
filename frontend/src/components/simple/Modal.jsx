import IconButton from './IconButton.jsx';
import { faCircleXmark, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

const Modal = ({ children, onClose, onSubmit, bClassName, title, zIndex }) => {
  return (createPortal(
    <div
      className={"font-bold text-[var(--color-text)] window-center w-[480px] h-[550px] rounded-[15px]"}
      style={{ zIndex }}>
      <div className={"p-[5px_10px] flex justify-between items-center gap-[10px] bg-[var(--color-comp)]"}>
        <span className={"uppercase text-clipped"}>{title}</span>
        <div>
          <IconButton size={"xl"} title={"Save"} onClick={onSubmit} icon={faFloppyDisk}/>
          <IconButton size={"xl"} title={"Close"} onClick={onClose} icon={faCircleXmark}/>
        </div>
      </div>
      <div className={twMerge("bg-[var(--color-third)] p-[15px_25px] s-scroll s-scroll-comp overflow-x-hidden overflow-y-auto min-h-full h-full", bClassName)}>
        {children}
      </div>
    </div>, document.body))
}

export default Modal;