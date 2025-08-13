import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { App } from './App';

function getUserId(): string {
  // Для локальной отладки берём ?user_id=... из URL, иначе мок
  const params = new URLSearchParams(window.location.search);
  return params.get('user_id') || '12345';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App userId={getUserId()} />
  </React.StrictMode>
);