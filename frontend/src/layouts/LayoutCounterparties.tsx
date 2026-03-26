import { LoansProvider } from '../context/LoansProvider';
import { Outlet } from 'react-router-dom';
import { CounterpartiesProvider } from '../context/CounterpartiesProvider';
import SupplementaryProviders from '../context/SupplementaryProviders';

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