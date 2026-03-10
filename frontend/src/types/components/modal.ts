export interface ModalStackProps {
    title: string,
    content: string,
    closeFunc?: () => void,
    saveFunc?: () => Promise<void>,
    hideOnSave: boolean
}