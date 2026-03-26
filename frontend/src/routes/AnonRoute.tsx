import { useAccount } from '../context/AccountProvider.jsx';
import { Navigate, Outlet } from 'react-router-dom';
import { authStatuses } from '../helpers/variables.js';
;

const AnonRoute = () => {
    const { authStatus } = useAccount();

    if (authStatus !== authStatuses.anon) {
        const to = authStatus === authStatuses.loggedVerified ? "/" : "/verify"
        return <Navigate to={to} replace />;
    }

    return <Outlet />;
};

export default AnonRoute;