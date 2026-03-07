import { ConfirmationProvider } from './ConfirmationProvider.jsx';
import { ModalProvider } from './ModalProvider.jsx';

const SupplementaryProviders = ({children}) => {
  return (
    <ConfirmationProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ConfirmationProvider>
  )
}

export default SupplementaryProviders;