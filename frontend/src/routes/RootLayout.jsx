import { Outlet } from 'react-router-dom';
import { AccountProvider } from '../context/AccountProvider.jsx';
import useLoader from '../hooks/useLoader.jsx';

const RootLayout = () => {
  const {
    hideLoader,
    LoaderElement: AuthLoader
  } = useLoader({ isLoading: true, overlayColor: "bg-[var(--color-main)]" });

  return (
    <AccountProvider onAuthReady={hideLoader}>
      <AuthLoader>
        <Outlet/>
      </AuthLoader>
    </AccountProvider>
  );
};

export default RootLayout;