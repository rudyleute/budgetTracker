import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Layout from '../Layout.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import MainPage from '../pages/MainPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';
import LoansPage from '../pages/loans/LoansPage.jsx';
import PublicRoute from './PublicRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { TransactionsProvider } from '../context/TransactionsProvider.jsx';
import { ConfirmationProvider } from '../context/ConfirmationProvider.jsx';
import { ModalProvider } from '../context/ModalProvider.jsx';
import { CategoriesProvider } from '../context/CategoriesProvider.jsx';
import { LoansProvider } from '../context/LoansProvider.jsx';
import RootLayout from './RootLayout.jsx';
import LoanPage from '../pages/loans/LoanPage.jsx';
import CounterpartiesPage from '../pages/counterparties/CounterpartiesPage.jsx';
import CounterpartyPage from '../pages/counterparties/CounterpartyPage.jsx';

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
              index: true, element: <TransactionsProvider>
                <CategoriesProvider>
                  <ModalProvider>
                    <ConfirmationProvider>
                      <MainPage/>
                    </ConfirmationProvider>
                  </ModalProvider>
                </CategoriesProvider>
              </TransactionsProvider>
            },
            {
              path: "loans", element: <LoansProvider>
                <ModalProvider>
                  <ConfirmationProvider>
                    <Outlet/>
                  </ConfirmationProvider>
                </ModalProvider>
              </LoansProvider>,
              children: [
                {index: true, element: <LoansPage />},
                {path: ":id", element: <LoanPage />}
              ]
            },
            // {
            //   path: "counterparties",
            //   children: [
            //     {index: true, element: <CounterpartiesPage />},
            //     {path: ":id", element: <CounterpartyPage />}
            //   ]
            // },
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