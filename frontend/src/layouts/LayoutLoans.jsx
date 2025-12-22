import { ModalProvider } from '../context/ModalProvider.jsx';
import { ConfirmationProvider } from '../context/ConfirmationProvider.jsx';
import { Outlet } from 'react-router-dom';
import { LoansProvider } from '../context/LoansProvider.jsx';

const LayoutLoans = () => {
  return (
    <LoansProvider>
      <ModalProvider>
        <ConfirmationProvider>
          <Outlet/>
        </ConfirmationProvider>
      </ModalProvider>
    </LoansProvider>
  )
}

export default LayoutLoans;