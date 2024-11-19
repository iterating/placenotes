import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./assets/styles.css"
import AppRouter from './app/AppRouter.jsx'

const container = document.getElementById("root")
if (!container) throw new Error("No root element found")
const root = createRoot(container)
root.render(
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
)


