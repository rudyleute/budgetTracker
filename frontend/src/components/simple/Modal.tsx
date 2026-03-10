import IconButton from './IconButton';
import { faCircleXmark, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import React from "react";
import {ButtonProps} from "./Button";

interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
    children: React.ReactNode;
    bClassName?: string;
    showHideButton: boolean;
    zIndex: number;
    onClose: () => void;
    onSubmit: ButtonProps["onClick"]
}

const Modal = ({ children, onClose, onSubmit, bClassName, title, zIndex, showHideButton }: ModalProps) => {
    return (createPortal(
        <div
            className={"flex flex-col font-bold text-(--color-text) window-center w-full max-w-[480px] box-content h-[550px] rounded-[15px]"}
            style={{ zIndex }}>
            <div className={"p-[5px_10px] flex justify-between items-center gap-2.5 bg-(--color-sec)"}>
                <span className={"uppercase text-clipped"}>{title}</span>
                <div className={"shrink-0"}>
                    {showHideButton && <IconButton size={"xl"} title={"Save"} onClick={onSubmit} icon={faFloppyDisk}/>}
                    <IconButton size={"xl"} title={"Close"} onClick={onClose} icon={faCircleXmark}/>
                </div>
            </div>
            <div className={twMerge("grow bg-(--color-main) p-[15px_25px] s-scroll s-scroll-alt-color overflow-x-hidden overflow-y-auto", bClassName)}>
                {children}
            </div>
        </div>, document.body))
}

export default Modal;