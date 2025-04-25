// src/main.jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'   // ← импортируем роутер
import App from './App'
import './index.css'

// Чтобы axios отдавал и брал CSRF-куки для DRF SessionAuth:
axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

// и прокси-базу, если не используете vite.config.js proxy:
axios.defaults.baseURL = 'http://localhost:8001'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>                               {/* ← обёртка */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)