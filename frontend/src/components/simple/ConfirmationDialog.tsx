import { createPortal } from 'react-dom';
import Button from './Button';
import React from "react";
import {ConfirmationState} from "../../types/components/confirmation";

const ConfirmationDialog = ({ onReject, onAccept, text }: Omit<ConfirmationState, 'isShown'>) => {
    return createPortal(
        <div className={"bg-(--color-main) z-3000 w-full max-w-[400px] h-[250px] window-center rounded-[15px] flex flex-col text-(--color-text) font-bold"}>
            <div className={"h-[80%] p-[10px_15px]"}>
                <span>Are you sure that you want to delete {text}?</span>
            </div>
            <div className={"grow flex justify-around items-center gap-2.5 p-[7px_10px]"}>
                <Button className={"w-[50%] btn-classic jump-05 bg-(--color-third)"} onClick={onReject}>Cancel</Button>
                <Button className={"w-[50%] btn-classic jump-05 bg-(--color-sec)"} onClick={onAccept}>Confirm</Button>
            </div>
        </div>, document.body);
}

export default ConfirmationDialog;