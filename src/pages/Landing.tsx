import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Activity, Shield, Calendar, Users, Star, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [especialidad, setEspecialidad] = useState('');
  const [distrito, setDistrito] = useState('');
  const [loading, setLoading] = useState(false);
  const [rolActivo, setRolActivo] = useState('paciente'); // 'paciente' o 'fisio'

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* HEADER (Fiel a la barra superior de image_698ae0.jpg) */}
      <nav className="bg-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-purple-700 tracking-tight">FisioCare</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#inicio" className="hover:text-purple-700 transition">Inicio</a>
            <a href="#especialistas" className="hover:text-purple-700 transition">Especialistas</a>
            <a href="#faq" className="hover:text-purple-700 transition">FAQ</a>
            <a href="#unete" className="text-purple-600 hover:text-purple-800 transition">¿Eres fisio? Únete</a>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <button className="text-slate-700 hover:text-purple-700 transition">
              Iniciar sesión
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full shadow-sm transition">
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Réplica exacta de la distribución de image_698ae0.jpg) */}
      <header id="inicio" className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Lado Izquierdo: Textos y Selectores de Rol */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full">
            ✨ Fisioterapeutas verificados en Lima
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Encuentra tu <br />
            <span className="text-purple-600">fisioterapeuta <br />verificado</span>, donde <br />
            estés
          </h1>
          
          <p className="text-lg text-slate-500 max-w-xl leading-relaxed font-normal">
            Reserva sesiones a domicilio o por videollamada con profesionales colegiados. Recupérate con confianza, en tus tiempos.
          </p>

          {/* Botones de alternancia de rol */}
          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={() => setRolActivo('paciente')}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm transition ${
                rolActivo === 'paciente' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Soy paciente
            </button>
            <button 
              onClick={() => setRolActivo('fisio')}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm transition ${
                rolActivo === 'fisio' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Soy fisioterapeuta
            </button>
          </div>
        </div>

        {/* Lado Derecho: Tarjeta de Buscador Oscura Premium */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-purple-950/20 text-white space-y-6">
            
            <h3 className="text-xl font-bold tracking-tight">
              Buscar fisioterapeuta ideal
            </h3>

            <form onSubmit={handleBuscar} className="space-y-5">
              
              {/* Campo Especialidad */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-purple-200 uppercase block">
                  ¿QUÉ ESPECIALIDAD BUSCAS?
                </label>
                <div className="relative bg-white/10 rounded-xl border border-white/10 focus-within:border-white/30 transition">
                  <select 
                    className="w-full bg-transparent py-4 pl-4 pr-10 focus:outline-none text-sm appearance-none cursor-pointer font-medium text-white"
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                  >
                    <option value="" className="text-slate-900">Todas las especialidades</option>
                    <option value="traumatologia" className="text-slate-900">Fisioterapia Traumatológica</option>
                    <option value="deportiva" className="text-slate-900">Fisioterapia Deportiva</option>
                    <option value="neurologica" className="text-slate-900">Fisioterapia Neurológica</option>
                    <option value="geriatrica" className="text-slate-900">Fisioterapia Geriátrica</option>
                  </select>
                  <Search className="absolute right-4 top-4.5 h-4 w-4 text-purple-300 pointer-events-none" />
                </div>
              </div>

              {/* Campo Distrito */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-purple-200 uppercase block">
                  ¿TU DISTRITO EN LIMA?
                </label>
                <div className="relative bg-white/10 rounded-xl border border-white/10 focus-within:border-white/30 transition">
                  <select 
                    className="w-full bg-transparent py-4 pl-4 pr-10 focus:outline-none text-sm appearance-none cursor-pointer font-medium text-white"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                  >
                    <option value="" className="text-slate-900">Cualquier distrito</option>
                    <option value="miraflores" className="text-slate-900">Miraflores</option>
                    <option value="san-isidro" className="text-slate-900">San Isidro</option>
                    <option value="surco" className="text-slate-900">Santiago de Surco</option>
                    <option value="san-borja" className="text-slate-900">San Borja</option>
                  </select>
                  <MapPin className="absolute right-4 top-4.5 h-4 w-4 text-purple-300 pointer-events-none" />
                </div>
              </div>

              {/* Botón de Enviar Blanco Estilizado */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white hover:bg-purple-50 text-purple-900 font-extrabold rounded-xl py-4 text-sm tracking-wide shadow-lg transition duration-200 disabled:opacity-80"
              >
                {loading ? 'Buscando...' : 'Buscar Fisioterapeutas'}
              </button>

            </form>
          </div>
        </div>
      </header>

      {/* SECCIÓN ADICIONAL: BENEFICIOS (Para robustecer la página de inicio) */}
      <section id="especialistas" className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">¿Por qué FisioCare?</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">Diseñado para que tu recuperación sea simple, rápida y completamente segura.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Profesionales verificados</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Todos nuestros fisioterapeutas tienen colegiatura validada y documentación al día.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">A domicilio o por video</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Atención en tu hogar en Lima o sesiones online desde donde estés, sin traslados molestos.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Historial Clínico</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Controla tu avance médico y comparte radiografías o reportes directamente en la nube.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <span className="text-sm font-black text-purple-700">FisioCare</span>
          <p>© {new Date().getFullYear()} FisioCare. Todos los derechos reservados. Lima, Perú.</p>
        </div>
      </footer>

    </div>
  );
}