import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import { AccountProvider } from './context/AccountProvider.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
        <AccountProvider>
            <App/>
            <ToastContainer position={"bottom-center"} draggable={false} />
        </AccountProvider>
    </Router>
  </StrictMode>
)
