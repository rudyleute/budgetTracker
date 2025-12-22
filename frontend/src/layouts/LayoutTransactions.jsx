import { Outlet } from 'react-router-dom';
import { TransactionsProvider } from '../context/TransactionsProvider.jsx';
import { CategoriesProvider } from '../context/CategoriesProvider.jsx';
import { ConfirmationProvider } from '../context/ConfirmationProvider.jsx';
import { ModalProvider } from '../context/ModalProvider.jsx';

const LayoutTransactions = () => {
  return (
    <TransactionsProvider>
      <CategoriesProvider>
        <ModalProvider>
          <ConfirmationProvider>
            <Outlet/>
          </ConfirmationProvider>
        </ModalProvider>
      </CategoriesProvider>
    </TransactionsProvider>
  );
}

export default LayoutTransactions;