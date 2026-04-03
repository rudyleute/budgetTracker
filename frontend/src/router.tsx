import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import NotFoundPage from './pages/NotFoundPage';
import TransactionsPage from './pages/TransactionsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoansPage from './pages/loans/LoansPage.jsx';
import AnonRoute from './routes/AnonRoute.jsx';
import VerifiedRoute from './routes/VerifiedRoute.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import LoanPage from './pages/loans/LoanPage.jsx';
import CounterpartiesPage from './pages/counterparties/CounterpartiesPage.jsx';
import CounterpartyPage from './pages/counterparties/CounterpartyPage.jsx';
import LayoutTransactions from './layouts/LayoutTransactions.jsx';
import LayoutLoans from './layouts/LayoutLoans.jsx';
import LayoutCounterparties from './layouts/LayoutCounterparties.jsx';
import UnverifiedRoute from './routes/UnverifiedRoute.jsx';
import VerifyPage from './pages/VerifyPage.jsx';
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