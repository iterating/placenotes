import React from "react"
import { createRoot } from "react-dom/client"
// import { Provider } from 'react-redux'
import { BrowserRouter } from "react-router-dom"

import "./assets/styles.css"
import App from "./App"

const root = document.getElementById("root")
if (!root) throw new Error("No root element found")
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
