import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runStorageCleanup } from './lib/storageCleanup'

// Limpeza one-time de estado legado (chave Anthropic antiga, modelo selecionado legado)
// antes do render — os stores zustand hidratam depois, já sobre dados limpos.
runStorageCleanup()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
