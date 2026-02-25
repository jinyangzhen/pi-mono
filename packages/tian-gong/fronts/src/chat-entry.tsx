import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChatApp } from './apps/chat/ChatApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatApp />
  </React.StrictMode>,
)
