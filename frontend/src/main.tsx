import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router-dom';
import "./styles/main.css"
import router from './router';
import React from "react";

createRoot(document.getElementById('root')!).render(
    <>
        <RouterProvider router={router}/>
        <ToastContainer position={"bottom-center"} draggable={false}/>
    </>
)
