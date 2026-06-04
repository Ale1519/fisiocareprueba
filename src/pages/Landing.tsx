import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Activity, Shield, Users, Calendar, ArrowRight, Star } from 'lucide-react';

export default function Landing() {
  const [especialidad, setEspecialidad] = useState('');
  const [distrito, setDistrito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí irá la lógica para redirigir o filtrar con Supabase
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-purple-900 tracking-tight">FisioCare</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-purple-600 transition">Beneficios</a>
            <a href="#como-funciona" className="hover:text-purple-600 transition">¿Cómo funciona?</a>
            <a href="#testimonios" className="hover:text-purple-600 transition">Testimonios</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-purple-600 hover:text-purple-700 px-3 py-2">
              Iniciar Sesión
            </button>
            <button className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-sm transition">
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-purple-500/30">
            Fisioterapia de confianza a tu alcance
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Encuentra al fisioterapeuta ideal para tu recuperación
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto font-light">
            Reserva citas con profesionales calificados en Lima para atención a domicilio o en consultorio. Tu bienestar no puede esperar.
          </p>

          {/* BUSCADOR PRINCIPAL */}
          <div className="pt-6 max-w-4xl mx-auto">
            <form onSubmit={handleBuscar} className="bg-white p-3 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-800">
              
              {/* Selector Especialidad */}
              <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <select 
                  className="w-full bg-transparent focus:outline-none text-sm appearance-none cursor-pointer font-medium text-slate-700"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                >
                  <option value="">¿Qué especialidad buscas?</option>
                  <option value="traumatologia">Fisioterapia Traumatológica</option>
                  <option value="deportiva">Fisioterapia Deportiva</option>
                  <option value="neurologica">Fisioterapia Neurológica</option>
                  <option value="pediatrica">Fisioterapia Pediátrica</option>
                  <option value="geriatrica">Fisioterapia Geriátrica</option>
                </select>
              </div>

              {/* Selector Distrito */}
              <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <select 
                  className="w-full bg-transparent focus:outline-none text-sm appearance-none cursor-pointer font-medium text-slate-700"
                  value={distrito}
                  onChange={(e) => setDistrito(e.target.value)}
                >
                  <option value="">¿Tu distrito en Lima?</option>
                  <option value="miraflores">Miraflores</option>
                  <option value="san-isidro">San Isidro</option>
                  <option value="surco">Santiago de Surco</option>
                  <option value="san-borja">San Borja</option>
                  <option value="los-olivos">Los Olivos</option>
                  <option value="la-molina">La Molina</option>
                </select>
              </div>

              {/* Botón de Acción */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm py-3 px-6 shadow transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Buscando...' : 'Buscar Fisioterapeuta'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* BENEFICIOS SECTION */}
      <section id="beneficios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">¿Por qué elegir FisioCare?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Diseñamos una plataforma pensada en tu comodidad, seguridad y una pronta recuperación.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Profesionales Verificados</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Validamos el perfil de cada terapeuta, sus certificaciones y antecedentes para garantizarte una atención segura y ética.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Flexibilidad de Horarios</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tú eliges el momento. Agenda tu sesión en el horario que mejor se adapte a tu rutina diaria, sin complicaciones ni llamadas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Atención Personalizada</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Ya sea en la comodidad de tu hogar o directo en el consultorio del especialista, recibes un tratamiento enfocado en tu caso específico.
            </p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA SECTION */}
      <section id="como-funciona" className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Tu recuperación en 3 simples pasos</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Olvídate de las largas esperas. Conecta y agenda en menos de 5 minutos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="text-center space-y-3 relative z-10">
              <div className="h-12 w-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-md">1</div>
              <h3 className="text-lg font-semibold text-slate-900 pt-2">Filtra y Busca</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Selecciona la especialidad de fisioterapia que necesitas y tu distrito actual.</p>
            </div>
            <div className="text-center space-y-3 relative z-10">
              <div className="h-12 w-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-md">2</div>
              <h3 className="text-lg font-semibold text-slate-900 pt-2">Compara Perfiles</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Revisa las opiniones de otros pacientes, sus precios, horarios y experiencia previa.</p>
            </div>
            <div className="text-center space-y-3 relative z-10">
              <div className="h-12 w-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-md">3</div>
              <h3 className="text-lg font-semibold text-slate-900 pt-2">Agenda tu Cita</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Reserva de forma segura y prepárate para empezar tu proceso de rehabilitación.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS SECTION */}
      <section id="testimonios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Lo que dicen nuestros pacientes</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Historias reales de personas que recuperaron su movilidad gracias a FisioCare.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Carlos Mendoza", role: "Paciente (Surco)", text: "Excelente plataforma. Encontré un especialista en fisioterapia deportiva para mi lesión de rodilla el mismo día. La atención a domicilio fue impecable." },
            { name: "Ana Lucía Ortiz", role: "Paciente (Miraflores)", text: "Me encanta la facilidad para agendar. Los perfiles son super claros y te da mucha tranquilidad saber que los terapeutas están completamente verificados." },
            { name: "Miguel Benítez", role: "Paciente (San Borja)", text: "Mi padre necesitaba terapia geriátrica continua. Gracias a FisioCare conectamos con un profesional con una paciencia y calidad humana increíbles." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <p className="text-slate-600 text-sm italic leading-relaxed">"{item.text}"</p>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-4">
                <div className="h-10 w-10 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                  {item.name.charAt(0)}{item.name.split(' ')[1]?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Activity className="h-5 w-5 text-purple-500" />
            <span>FisioCare</span>
          </div>
          <p>© {new Date().getFullYear()} FisioCare. Todos los derechos reservados. Desarrollado para Lima, Perú.</p>
        </div>
      </footer>

    </div>
  );
}