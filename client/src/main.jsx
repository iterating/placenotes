import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import store from "./store/store.jsx"; // Import the store instance

import "./assets/styles.css"
import Router from './app/AppRouter.jsx'
import { Provider } from 'react-redux';

const container = document.getElementById("root")
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
