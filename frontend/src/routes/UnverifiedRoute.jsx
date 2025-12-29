import { useAccount } from '../context/AccountProvider.jsx';
import { Navigate, Outlet } from 'react-router-dom';
import { authStatuses } from '../helpers/variables.js';

const UnverifiedRoute = () => {
  const { authStatus } = useAccount();

  if (authStatus !== authStatuses.loggedUnverified) {
    const to = authStatus === authStatuses.loggedVerified ? "/" : "/login"
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
};

export default UnverifiedRoute;