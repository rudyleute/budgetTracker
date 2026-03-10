export interface ConfirmationState {
    isShown: boolean,
    onAccept: () => Promise<void>,
    onReject: () => void,
    text: string | null
}