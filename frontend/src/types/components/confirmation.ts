export interface ConfirmationState {
    isShown: boolean,
    onAccept: () => unknown,
    onReject: () => unknown,
    text: string | null
}