;
import { ConfirmationProvider } from './ConfirmationProvider';
import { ModalProvider } from './ModalProvider';
import {ChildrenProp} from "../types/basic";

const SupplementaryProviders = ({children}: ChildrenProp) => {
    return (
        <ConfirmationProvider>
            <ModalProvider>
                {children}
            </ModalProvider>
        </ConfirmationProvider>
    )
}

export default SupplementaryProviders;