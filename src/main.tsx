import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/NavBar';
import Landing from './pages/Landing'
import Especialistas from './pages/Especialistas'
import ComoFunciona from './pages/ComoFunciona'
import LoginPage from './pages/LoginPage'
import RegisterPaciente from './pages/RegisterPaciente'
import SelectionRegister from './pages/SelectionRegister';
import RegisterFisio from './pages/RegisterFisio';
import DashboardPaciente from './pages/DashboardPaciente';
import DashboardFisio from './pages/DashboardFisio'; 
import EspecialistaDetalle from './pages/EspecialistaDetalle'; 
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/especialistas" element={<Especialistas />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/seleccion-registro" element={<SelectionRegister />} />
        <Route path="/registro-paciente" element={<RegisterPaciente />} />
        <Route path="/registro-fisio" element={<RegisterFisio />} />
        <Route path="/dashboard-paciente" element={<DashboardPaciente />} />
        <Route path="/dashboard-fisio" element={<DashboardFisio />} /> {/* 2. Registramos la ruta */}
        <Route path="/especialistas/:id" element={<EspecialistaDetalle />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
