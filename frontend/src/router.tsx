import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import NotFoundPage from './pages/NotFoundPage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import LoansPage from './pages/loans/LoansPage';
import AnonRoute from './routes/AnonRoute';
import VerifiedRoute from './routes/VerifiedRoute';
import RootLayout from './layouts/RootLayout';
import LoanPage from './pages/loans/LoanPage';
import CounterpartiesPage from './pages/counterparties/CounterpartiesPage';
import CounterpartyPage from './pages/counterparties/CounterpartyPage';
import LayoutTransactions from './layouts/LayoutTransactions';
import LayoutLoans from './layouts/LayoutLoans';
import LayoutCounterparties from './layouts/LayoutCounterparties';
import UnverifiedRoute from './routes/UnverifiedRoute';
import VerifyPage from './pages/VerifyPage';
;

const router = createBrowserRouter([
    {
        element: <RootLayout/>,
        children: [
            {
                element: <AnonRoute />,
                children: [
                    { path: "/login", element: <LoginPage /> },
                    { path: "/signup", element: <SignUpPage /> }
                ]
            },
            {
                element: <UnverifiedRoute />,
                children: [
                    { path: "/verify", element: <VerifyPage /> }
                ]
            },
            {
                path: "/",
                element: <VerifiedRoute/>,
                children: [{
                    element: <Layout/>,
                    children: [
                        {
                            element: <LayoutTransactions/>,
                            children: [
                                { index: true, element: <TransactionsPage/> }
                            ]
                        },
                        {
                            path: "loans", element: <LayoutLoans />,
                            children: [
                                { index: true, element: <LoansPage/> },
                                { path: ":id", element: <LoanPage/> }
                            ]
                        },
                        {
                            path: "counterparties",
                            element: <LayoutCounterparties />,
                            children: [
                                { index: true, element: <CounterpartiesPage/> },
                                { path: ":id", element: <CounterpartyPage/> }
                            ]
                        },
                        // { path: "profile", element: <ProfilePage /> },
                        // { path: "dashboard", element: <DashboardPage />},
                        { path: "*", element: <NotFoundPage/> }
                    ]
                }]
            }
        ]
    }
]);

export default router;