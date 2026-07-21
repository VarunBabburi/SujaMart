import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { registerSW }
from "virtual:pwa-register";


registerSW({
immediate:true
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    
     <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        toastClassName="custom-toast"
    />
  </BrowserRouter>
);