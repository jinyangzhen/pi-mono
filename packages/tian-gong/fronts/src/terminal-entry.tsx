import React from 'react'
import ReactDOM from 'react-dom/client'
import { TerminalApp } from './apps/terminal/TerminalApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TerminalApp />
  </React.StrictMode>,
)
