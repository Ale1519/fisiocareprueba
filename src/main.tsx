import React from 'react';
import ReactDOM from 'react-dom/client';
import { Landing } from './pages/Landing';
import './index.css'; // Estilos globales

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Landing />
  </React.StrictMode>
);