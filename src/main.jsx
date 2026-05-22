import React from 'react'
import { StrictMode } from 'react'
import { createRoot }from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 App starting...')

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('❌ Element #root tidak ditemukan di HTML!')
  }
  console.log('✅ #root ditemukan')
  
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  console.log('✅ React rendered successfully')
} catch (error) {
  console.error('❌ CRITICAL ERROR:', error)
  document.body.innerHTML = `<div style="padding: 2rem; background: #1e1e2e; color: red; font-family: monospace;">
    <h2>Error Aplikasi</h2>
    <pre>${error.message}</pre>
    <p>Cek console (F12) untuk detail</p>
  </div>`
}
