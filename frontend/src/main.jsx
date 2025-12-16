import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router-dom';
import "./styles/main.css"
import router from './routes/router.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
    <ToastContainer position={"bottom-center"} draggable={false}/>
  </StrictMode>
)
