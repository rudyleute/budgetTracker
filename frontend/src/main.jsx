import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import { AccountProvider } from './context/AccountProvider.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { LoaderProvider } from './context/LoaderProvider.jsx';
import { AuthenticatedProviders } from './context/AuthenticatedProviders.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <LoaderProvider>
        <AccountProvider>
          <AuthenticatedProviders>
            <App/>
            <ToastContainer position={"bottom-center"} draggable={false} />
          </AuthenticatedProviders>
        </AccountProvider>
      </LoaderProvider>
    </Router>
  </StrictMode>
)
