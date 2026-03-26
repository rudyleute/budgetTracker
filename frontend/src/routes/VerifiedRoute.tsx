import { useAccount } from '../context/AccountProvider.jsx';
import { Navigate, Outlet } from 'react-router-dom';
import { authStatuses } from '../helpers/variables.js';
;

const VerifiedRoute = () => {
    const { authStatus } = useAccount();

    if (authStatus !== authStatuses.loggedVerified) {
        const to = authStatus === authStatuses.loggedUnverified ? "/verify" : "/login"
        return <Navigate to={to} replace />;
    }

    return <Outlet />;
};

export default VerifiedRoute;