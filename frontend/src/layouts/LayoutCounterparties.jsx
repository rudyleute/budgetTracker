import { LoansProvider } from '../context/LoansProvider.jsx';
import { ModalProvider } from '../context/ModalProvider.jsx';
import { ConfirmationProvider } from '../context/ConfirmationProvider.jsx';
import { Outlet } from 'react-router-dom';
import { CounterpartiesProvider } from '../context/CounterpartiesProvider.jsx';

const LayoutCounterparties = () => {
  return (
    <CounterpartiesProvider>
      <LoansProvider skipInitFetch={true}>
        <ModalProvider>
          <ConfirmationProvider>
            <Outlet/>
          </ConfirmationProvider>
        </ModalProvider>
      </LoansProvider>
    </CounterpartiesProvider>
  )
}

export default LayoutCounterparties;