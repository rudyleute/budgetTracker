import { LoansProvider } from '../context/LoansProvider.jsx';
import { Outlet } from 'react-router-dom';
import { CounterpartiesProvider } from '../context/CounterpartiesProvider.jsx';
import SupplementaryProviders from '../context/SupplementaryProviders.jsx';

const LayoutCounterparties = () => {
  return (
    <CounterpartiesProvider>
      <LoansProvider skipInitFetch={true}>
        <SupplementaryProviders>
            <Outlet/>
        </SupplementaryProviders>
      </LoansProvider>
    </CounterpartiesProvider>
  )
}

export default LayoutCounterparties;