import { TransactionsProvider } from './TransactionsProvider.jsx';
import { ModalProvider } from './ModalProvider.jsx';
import { ConfirmationProvider } from './ConfirmationProvider.jsx';
import { CategoriesProvider } from './CategoriesProvider.jsx';
import { useAccount } from './AccountProvider.jsx';
import { GridLoader } from 'react-spinners';

const AuthenticatedProviders = ({ children }) => {
  const { loading } = useAccount();

  if (loading) {
    return (
      <div className="w-full h-screen bg-[var(--color-third)] flex items-center justify-center">
        <GridLoader size={30} color={"#640D5F"} />
      </div>
    );
  }

  return (
    <TransactionsProvider>
      <CategoriesProvider>
        <ConfirmationProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </ConfirmationProvider>
      </CategoriesProvider>
    </TransactionsProvider>
  )
}

export { AuthenticatedProviders };