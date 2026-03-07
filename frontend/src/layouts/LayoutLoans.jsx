import { Outlet } from 'react-router-dom';
import { LoansProvider } from '../context/LoansProvider.jsx';
import SupplementaryProviders from '../context/SupplementaryProviders.jsx';

const LayoutLoans = () => {
  return (
    <LoansProvider>
      <SupplementaryProviders>
        <Outlet />
      </SupplementaryProviders>
    </LoansProvider>
  )
}

export default LayoutLoans;