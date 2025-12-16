import { Outlet } from 'react-router-dom';
import { AccountProvider } from '../context/AccountProvider.jsx';

const RootLayout = () => {
  return (
    <AccountProvider>
      <Outlet />
    </AccountProvider>
  );
};

export default RootLayout;