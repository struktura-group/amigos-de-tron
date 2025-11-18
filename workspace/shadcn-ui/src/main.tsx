import React from 'react'; // <-- Importación necesaria para usar JSX (la sintaxis <.../>)
import { createRoot } from 'react-dom/client';
// 1. Importar HashRouter desde react-router-dom
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode> 
    // 2. Envolver el componente App con HashRouter 
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
