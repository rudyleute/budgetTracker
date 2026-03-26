import {ReactNode} from "react";

export interface ModalStackProps {
    title?: string,
    content: ReactNode,
    closeFunc?: () => void,
    saveFunc?: () => Promise<void>,
    hideOnSave?: boolean
}