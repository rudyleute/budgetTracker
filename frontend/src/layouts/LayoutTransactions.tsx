import { Outlet } from 'react-router-dom';
import { TransactionsProvider } from '../context/TransactionsProvider';
import { CategoriesProvider } from '../context/CategoriesProvider';
import SupplementaryProviders from '../context/SupplementaryProviders';

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