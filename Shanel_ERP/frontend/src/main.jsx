import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './index.css'
import './i18n';
import App from './App.jsx'
import './config/api'

// Clear auth keys if this is a fresh tab/window load
if (!sessionStorage.getItem('session_active')) {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('modules');
  localStorage.removeItem('userId');
  localStorage.removeItem('fullName');
  localStorage.removeItem('user_type');
  sessionStorage.setItem('session_active', 'true');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)  
