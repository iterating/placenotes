import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import store from "./store/store.jsx"; // Import the store instance

import "./assets/styles.css"
import AppRouter from './app/AppRouter.jsx'
import { Provider } from 'react-redux';

const container = document.getElementById("root")
if (!container) throw new Error("No root element found")
const root = createRoot(container)
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </Provider>
)