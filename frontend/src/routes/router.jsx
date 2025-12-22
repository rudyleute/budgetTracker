import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../Layout.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import TransactionsPage from '../pages/TransactionsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';
import LoansPage from '../pages/loans/LoansPage.jsx';
import PublicRoute from './PublicRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RootLayout from './RootLayout.jsx';
import LoanPage from '../pages/loans/LoanPage.jsx';
import CounterpartiesPage from '../pages/counterparties/CounterpartiesPage.jsx';
import CounterpartyPage from '../pages/counterparties/CounterpartyPage.jsx';
import LayoutTransactions from '../layouts/LayoutTransactions.jsx';
import LayoutLoans from '../layouts/LayoutLoans.jsx';
import LayoutCounterparties from '../layouts/LayoutCounterparties.jsx';

const router = createBrowserRouter([
  {
    element: <RootLayout/>,
    children: [
      {
        path: "/",
        element: <ProtectedRoute/>,
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
            { path: "login", element: <Navigate to="/" replace/> },
            { path: "signup", element: <Navigate to="/" replace/> },
            { path: "*", element: <NotFoundPage/> }
          ]
        }]
      },
      {
        path: "/",
        element: <PublicRoute/>,
        children: [
          { index: true, element: <Navigate to="/login" replace/> },
          { path: "login", element: <LoginPage/> },
          { path: "signup", element: <SignUpPage/> },
          { path: "*", element: <Navigate to="/" replace/> }
        ]
      }
    ]
  }
]);

export default router;