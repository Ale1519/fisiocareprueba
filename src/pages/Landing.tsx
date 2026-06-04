import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Especialidad { id: string; nombre: string; }
interface Distrito { id: string; nombre: string; }

export const Landing = () => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroDistrito, setFiltroDistrito] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCatalogos = async () => {
      const { data: dataEsp } = await supabase.from('especialidades').select('*').order('nombre');
      if (dataEsp) setEspecialidades(dataEsp);

      const { data: dataDist } = await supabase.from('distritos').select('*').order('nombre');
      if (dataDist) setDistritos(dataDist);

      setLoading(false);
    };
    cargarCatalogos();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* HEADER / NAVBAR NAVIGATION */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="text-2xl font-black text-purple-700 tracking-tight">FisioCare</div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-purple-600 transition">Inicio</a>
          <a href="#" className="hover:text-purple-600 transition">Especialistas</a>
          <a href="#" className="hover:text-purple-600 transition">FAQ</a>
          <a href="#" className="text-purple-600 font-semibold hover:underline">¿Eres fisio? Únete</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition">Iniciar sesión</button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition">Registrarse</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">
            ✨ Fisioterapeutas verificados en Lima
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
            Encuentra tu <br />
            <span className="text-purple-600">fisioterapeuta verificado</span>, donde estés
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Reserva sesiones a domicilio o por videollamada con profesionales colegiados. Recupérate con confianza, en tus tiempos.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition">Soy paciente</button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-8 py-3.5 rounded-xl transition">Soy fisioterapeuta</button>
          </div>
        </div>

        {/* BUSCADOR INTEGRADO EN EL HERO */}
        <div className="bg-gradient-to-tr from-purple-700 to-indigo-800 p-8 rounded-3xl shadow-xl text-white space-y-5">
          <h3 className="text-xl font-bold tracking-tight">Buscar fisioterapeuta ideal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase mb-1">¿Qué especialidad buscas?</label>
              <select 
                value={filtroEspecialidad} 
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="" className="text-black">Todas las especialidades</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id} className="text-black">{esp.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase mb-1">¿Tu distrito en Lima?</label>
              <select 
                value={filtroDistrito} 
                onChange={(e) => setFiltroDistrito(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="" className="text-black">Cualquier distrito</option>
                {distritos.map((dist) => (
                  <option key={dist.id} value={dist.id} className="text-black">{dist.nombre}</option>
                ))}
              </select>
            </div>

            <button className="w-full bg-white hover:bg-purple-50 text-purple-700 font-black py-3.5 rounded-xl shadow-md transition duration-200 mt-2">
              Buscar Fisioterapeutas
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN: ¿POR QUÉ FISIOCARE? */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-black text-gray-900">¿Por qué FisioCare?</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Diseñado para que tu recuperación sea simple y segura.</p>
          
          <div className="grid md:grid-cols-3 gap-8 pt-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left space-y-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">🛡️</div>
              <h4 className="text-lg font-bold text-gray-900">Profesionales verificados</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Todos nuestros fisioterapeutas tienen colegiatura validada y documentación al día.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left space-y-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">🏠</div>
              <h4 className="text-lg font-bold text-gray-900">A domicilio o por video</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Atención en tu hogar en Lima o sesiones online desde donde estés.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left space-y-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">👤</div>
              <h4 className="text-lg font-bold text-gray-900">Cuidado personalizado</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Reseñas reales, especialidades claras y precios transparentes para elegir mejor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: CÓMO FUNCIONA */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center space-y-4">
        <h2 className="text-3xl font-black text-gray-900">Cómo funciona</h2>
        <p className="text-gray-600">En 3 simples pasos estás en sesión.</p>

        <div className="grid md:grid-cols-3 gap-8 pt-10 position-relative">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black mx-auto">1</div>
            <h4 className="text-lg font-bold">Busca</h4>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Filtra por modalidad, distrito, precio y especialidad.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black mx-auto">2</div>
            <h4 className="text-lg font-bold">Elige y agenda</h4>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Revisa perfiles, reseñas y reserva el horario que prefieres.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black mx-auto">3</div>
            <h4 className="text-lg font-bold">Recibe tu sesión</h4>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Paga seguro con Yape o tarjeta y empieza tu recuperación.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-3">
            <div className="text-white text-xl font-black">FisioCare</div>
            <p className="text-xs">Conectamos pacientes con fisioterapeutas verificados en Lima.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Pacientes</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white">Buscar fisioterapeuta</a></li>
              <li><a href="#" className="hover:text-white">Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Profesionales</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white">Únete como fisio</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Contacto</h5>
            <p className="text-xs">hola@fisiocare.pe</p>
            <p className="text-xs">+51 999 888 777</p>
            <p className="text-xs mt-2 text-gray-500">Lima, Perú</p>
          </div>
        </div>
      </footer>

    </div>
  );
}; 
