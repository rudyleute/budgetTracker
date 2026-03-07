import { Outlet } from 'react-router-dom';
import { TransactionsProvider } from '../context/TransactionsProvider.jsx';
import { CategoriesProvider } from '../context/CategoriesProvider.jsx';
import SupplementaryProviders from '../context/SupplementaryProviders.jsx';

const LayoutTransactions = () => {
  return (
    <TransactionsProvider>
      <CategoriesProvider>
        <SupplementaryProviders>
          <Outlet/>
        </SupplementaryProviders>
      </CategoriesProvider>
    </TransactionsProvider>
  );
}

export default LayoutTransactions;