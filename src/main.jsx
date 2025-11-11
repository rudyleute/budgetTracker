import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { StrictMode } from 'react';
import {ToastContainer} from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
    <ToastContainer
      position={"bottom-center"}
      draggable={false}
    />
  </StrictMode>
)
