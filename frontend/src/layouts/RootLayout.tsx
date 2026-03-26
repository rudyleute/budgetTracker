import { Outlet } from 'react-router-dom';
import { AccountProvider } from '../context/AccountProvider.jsx';
import useLoader from '../hooks/useLoader.jsx';

const RootLayout = () => {
    const {
        hideLoader,
        LoaderElem: AuthLoader
    } = useLoader({ isLoading: true, overlayColor: "bg-(--color-main)" });

    return (
        <AccountProvider onAuthReady={hideLoader}>
            <AuthLoader>
                <Outlet/>
            </AuthLoader>
        </AccountProvider>
    );
};

export default RootLayout;