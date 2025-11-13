import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import { AccountProvider } from './context/AccountProvider.jsx';
import { ConfirmationProvider } from './context/ConfirmationProvider.jsx';
import { CategoriesProvider } from './context/CategoriesProvider.jsx';
import { ModalProvider } from './context/ModalProvider.jsx';
import { TransactionsProvider } from './context/TransactionsProvider.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { LoaderProvider } from './context/LoaderProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <LoaderProvider>
        <AccountProvider>
          <TransactionsProvider>
            <CategoriesProvider>
              <ConfirmationProvider>
                <ModalProvider>
                  <App/>
                  <ToastContainer
                    position={"bottom-center"}
                    draggable={false}
                  />
                </ModalProvider>
              </ConfirmationProvider>
            </CategoriesProvider>
          </TransactionsProvider>
        </AccountProvider>
      </LoaderProvider>
    </Router>
  </StrictMode>
)
