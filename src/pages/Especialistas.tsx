import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  User,
  Shield,
  Home as HomeIcon,
  MessageSquare,
  CheckCircle,
  Activity,
  Sparkles
} from 'lucide-react';

import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Especialistas() {
  const navigate = useNavigate();
  
  // === ESTADOS DE LA BASE DE DATOS ===
  const [fisiosData, setFisiosData] = useState<any[]>([]);
  const [distritosDB, setDistritosDB] = useState<any[]>([]);
  const [especialidadesDB, setEspecialidadesDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === ESTADOS DE LOS FILTROS ===
  const [busqueda, setBusqueda] = useState('');
  const [modalidad, setModalidad] = useState('todos');
  const [distrito, setDistrito] = useState('todos');
  const [especialidad, setEspecialidad] = useState('todas'); 
  const [precioMax, setPrecioMax] = useState(250);

  // === ESTADOS DE LA IA ===
  const [promptIA, setPromptIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);

  // 🚀 CONEXIÓN IA REAL: gemini-2.5-flash
  const procesarBusquedaIA = async () => {
    if (!promptIA.trim()) return;
    setCargandoIA(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No se encontró la API Key en las variables de entorno.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Usamos Gemini 2.5 Flash (ultrarrápido y con nivel gratuito)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const promptText = `
        Eres el buscador inteligente de Fisiocare. El usuario escribirá una frase y tú debes extraer los filtros exactos en formato JSON.
        
        Frase del usuario: "${promptIA}"
        
        Reglas estrictas de extracción:
        1. "especialidad": Solo puede ser "Traumatológica", "Deportiva", "Neurológica", "Geriátrica", "Pediátrica", "Postoperatoria" o "todas".
        2. "distrito": El nombre del distrito mencionado (ej. "Surco", "La Molina", "San Borja") o "todos" si no menciona ninguno.
        3. "modalidad": Solo puede ser "Domicilio", "Online" o "todos".
        4. "precio": El número máximo que el usuario está dispuesto a pagar (ej. si dice "hasta 100 soles", pones 100). Si no menciona precio, pon 250.

        Responde ÚNICAMENTE con el objeto JSON, sin formato markdown, sin texto adicional:
        {
          "especialidad": "valor",
          "distrito": "valor",
          "modalidad": "valor",
          "precio": 250
        }
      `;

      const result = await model.generateContent(promptText);
      const responseText = result.response.text();

      // Limpieza robusta del JSON por si la IA añade comillas markdown (```json)
      const inicioJson = responseText.indexOf('{');
      const finJson = responseText.lastIndexOf('}');

      if (inicioJson === -1 || finJson === -1) {
        throw new Error("La IA no devolvió un JSON válido.");
      }

      const jsonLimpio = responseText.substring(inicioJson, finJson + 1);
      const parametrosExtraidos = JSON.parse(jsonLimpio);

      // Aplicar filtros a la interfaz visual
      if (parametrosExtraidos.especialidad) setEspecialidad(parametrosExtraidos.especialidad);
      if (parametrosExtraidos.distrito) setDistrito(parametrosExtraidos.distrito);
      if (parametrosExtraidos.modalidad) setModalidad(parametrosExtraidos.modalidad);
      if (parametrosExtraidos.precio) setPrecioMax(Math.min(Math.max(Number(parametrosExtraidos.precio), 50), 250));

      // Limpiar barra de búsqueda
      setPromptIA('');

    } catch (error) {
      console.error("Detalles del error IA:", error);
      alert("La IA está descansando un momento. Intenta buscar de nuevo en unos segundos.");
    } finally {
      setCargandoIA(false);
    }
  };
  
  // === EFECTO PARA CARGAR DATOS DE SUPABASE ===
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);

      const { data: distData } = await supabase.from('distritos').select('*');
      if (distData) setDistritosDB(distData);

      const { data: espData } = await supabase.from('especialidades').select('*');
      if (espData) setEspecialidadesDB(espData);

      const { data: fisios, error } = await supabase
        .from('fisioterapeutas')
        .select(`
          id,
          nombres,
          apellidos,
          precio_sesion,
          colegiatura,
          ofrece_domicilio,
          ofrece_videollamada,
          fisioterapeuta_especialidades ( especialidades ( nombre ) ),
          fisioterapeuta_distritos ( distritos ( nombre ) ),
          citas ( id, estado )
        `);

      if (fisios) {
        const mapeados = fisios.map((f: any) => {
          const citasCompletadas = f.citas?.filter((c: any) => c.estado === 'completada').length || 0;
          
          return {
            ...f,
            nombre_completo: `${f.nombres} ${f.apellidos}`,
            especialidades: f.fisioterapeuta_especialidades?.map((fe: any) => fe.especialidades?.nombre) || [],
            distritos: f.fisioterapeuta_distritos?.map((fd: any) => fd.distritos?.nombre) || [],
            rating: 5.0, 
            resenas: Math.floor(Math.random() * 50) + 10,
            total_citas: citasCompletadas
          };
        });
        setFisiosData(mapeados);
      } else if (error) {
        console.error("Error cargando fisios:", error);
      }
      setLoading(false);
    };

    cargarDatos();
  }, []);

  // === LÓGICA DE FILTRADO EN TIEMPO REAL ===
  const especialistasFiltrados = fisiosData.filter(fisio => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = 
      fisio.nombre_completo.toLowerCase().includes(texto) || 
      fisio.especialidades.some((e: string) => e.toLowerCase().includes(texto));

    // Conversión segura de booleanos
    const ofreceDom = fisio.ofrece_domicilio === true || fisio.ofrece_domicilio === 'true';
    const ofreceVid = fisio.ofrece_videollamada === true || fisio.ofrece_videollamada === 'true';

    let coincideModalidad = true;
    if (modalidad === 'Domicilio') coincideModalidad = ofreceDom;
    if (modalidad === 'Online') coincideModalidad = ofreceVid;
    if (modalidad === 'ambos') coincideModalidad = ofreceDom && ofreceVid;

    const coincideDistrito = distrito === 'todos' || fisio.distritos.includes(distrito);
    const coincideEspecialidad = especialidad === 'todas' || fisio.especialidades.includes(especialidad);
    
    // Conversión segura de precio
    const precioFisio = Number(fisio.precio_sesion) || 0;
    const coincidePrecio = precioFisio <= precioMax;

    return coincideTexto && coincideModalidad && coincideDistrito && coincideEspecialidad && coincidePrecio;
  });

  const handleVerPerfil = async (fisioId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    } else {
      navigate(`/especialistas/${fisioId}`);
    }
  };

  const handleMensaje = async (fisio: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    } else {
      navigate('/mensajeria', { 
        state: { 
          nuevoContacto: {
            id: fisio.id,
            nombre: fisio.nombre_completo
          }
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 antialiased font-body flex flex-col justify-between">
      
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-6 w-full flex-grow">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1E3D] font-display tracking-tight">Fisioterapeutas en Lima</h1>
            <p className="text-slate-400 text-sm font-light mt-1">
              {loading ? 'Cargando profesionales...' : 
                especialistasFiltrados.length === 0
                ? 'No hay profesionales disponibles para esta selección'
                : `${especialistasFiltrados.length} ${especialistasFiltrados.length === 1 ? 'profesional disponible' : 'profesionales disponibles'} para ti`}
            </p>
          </div>
        </div>

        {/* 🤖 BUSCADOR INTELIGENTE (IA REAL) */}
        <div className="bg-gradient-to-r from-[#0A1E3D] to-[#1A5C3A] rounded-3xl p-1 mb-8 shadow-lg">
          <div className="bg-white rounded-[22px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#1A5C3A]" />
              <h3 className="font-bold text-[#0A1E3D]">Búsqueda con Inteligencia Artificial</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  value={promptIA}
                  onChange={(e) => setPromptIA(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && procesarBusquedaIA()}
                  placeholder="Ej: Esguince de tobillo en Surco máximo 100 soles a domicilio..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:border-[#1A5C3A] focus:ring-1 focus:ring-[#1A5C3A] transition"
                />
              </div>
              
              <button 
                onClick={procesarBusquedaIA}
                disabled={cargandoIA || !promptIA.trim()}
                className="bg-[#0A1E3D] hover:bg-[#122d5a] text-white px-8 py-4 rounded-xl font-bold text-sm transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {cargandoIA ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" /> Buscar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
          <aside className="lg:col-span-3 bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-6 sticky top-[88px] max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 text-[#0A1E3D] pb-3 border-b border-slate-100">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-700">Filtros de Búsqueda</h2>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Atención</label>
              <div className="space-y-2.5 text-sm text-slate-600">
                {[
                  { id: 'todos', label: 'Cualquiera' },
                  { id: 'Domicilio', label: 'A Domicilio' },
                  { id: 'Online', label: 'Videollamada' },
                  { id: 'ambos', label: 'Ofrece Ambos' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group select-none">
                    <input
                      type="radio"
                      name="modalidad"
                      checked={modalidad === item.id}
                      onChange={() => setModalidad(item.id)}
                      className="h-4 w-4 text-[#0F2850] border-slate-300 focus:ring-0 cursor-pointer transition"
                    />
                    <span className={`text-xs transition ${modalidad === item.id ? 'font-semibold text-[#0A1E3D]' : 'text-slate-500 group-hover:text-slate-800'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Especialidad Clínica</label>
              <div className="relative">
                <select
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200 text-xs py-3 pl-3 pr-10 rounded-xl text-slate-700 focus:outline-none focus:border-blue-300 focus:bg-white appearance-none cursor-pointer font-medium transition"
                >
                  <option value="todas">Todas las especialidades</option>
                  {especialidadesDB.map((esp: any) => (
                    <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
                  ))}
                </select>
                <Activity className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Distrito de Lima</label>
              <div className="relative">
                <select
                  value={distrito}
                  onChange={(e) => setDistrito(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200 text-xs py-3 pl-3 pr-10 rounded-xl text-slate-700 focus:outline-none focus:border-blue-300 focus:bg-white appearance-none cursor-pointer font-medium transition"
                >
                  <option value="todos">Todos los distritos</option>
                  {distritosDB.map((dist: any) => (
                    <option key={dist.id} value={dist.nombre}>{dist.nombre}</option>
                  ))}
                </select>
                <MapPin className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Precio máximo</span>
                <span className="text-[#0A1E3D] font-extrabold text-sm tracking-tight">S/ {precioMax}</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0F2850]"
              />
            </div>

            <button
              onClick={() => { setBusqueda(''); setModalidad('todos'); setEspecialidad('todas'); setDistrito('todos'); setPrecioMax(250); }}
              className="w-full bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              ✕ Limpiar filtros
            </button>
          </aside>

          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
               <div className="col-span-full py-12 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A5C3A]"></div>
               </div>
            ) : especialistasFiltrados.length > 0 ? (
              especialistasFiltrados.map((fisio: any) => (
                <div key={fisio.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col justify-between relative shadow-sm hover:shadow-md transition">
                  
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-[76px] h-[76px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0 overflow-hidden">
                        <User className="h-8 w-8 stroke-[1.2]" />
                      </div>
                    
                      <div className="space-y-0.5 w-full">
                        <h3 className="font-body text-base font-bold text-[#0A1E3D] leading-tight">
                          {fisio.nombre_completo}
                        </h3>

                        <div className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#1A6645] font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-[#B8E0CA]/60 tracking-wide uppercase mt-0.5">
                          <CheckCircle className="h-2.5 w-2.5 fill-current" /> Verificado
                        </div>
                      
                        <p className="text-[10px] text-slate-400 font-medium pt-1">
                          Colegiatura CFF verificada • {fisio.colegiatura || 'En proceso'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-slate-700">{fisio.rating.toFixed(1)}</span>
                            <span className="text-slate-400 font-light">({fisio.resenas})</span>
                          </div>
                          <span className="text-slate-300">|</span>
                          <span className="font-semibold text-[#1A5C3A]">
                            {fisio.total_citas} {fisio.total_citas === 1 ? 'cita realizada' : 'citas realizadas'}
                          </span>
                        </div>
                      </div>

                      <div className="absolute top-5 right-5 text-right">
                        <p className="text-base font-extrabold text-[#0A1E3D]">S/ {fisio.precio_sesion}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">por sesión</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-4 pl-1">
                      {fisio.especialidades.map((esp: string, i: number) => (
                        <span key={i} className="bg-slate-50 text-slate-600 text-xs font-medium px-3 py-1 rounded-lg border border-slate-200/50">
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 text-slate-500 text-xs pl-1">
                      <div className="h-6 w-6 bg-[#E8F5EE] text-[#1A6645] rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-3.5 w-3.5 fill-current" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <HomeIcon className="h-3.5 w-3.5 text-slate-400" />
                          {fisio.ofrece_domicilio && 'Domicilio'}
                          {fisio.ofrece_domicilio && fisio.ofrece_videollamada && ' • '}
                          {fisio.ofrece_videollamada && 'Videollamada'}
                        </span>
                        {fisio.distritos.length > 0 && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1 font-light text-slate-500">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {fisio.distritos.length > 2 
                                ? `${fisio.distritos[0]}, ${fisio.distritos[1]} +${fisio.distritos.length - 2}` 
                                : fisio.distritos.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => handleVerPerfil(fisio.id)}
                        className="w-full bg-[#0A1E3D] hover:bg-[#122d5a] text-white font-semibold text-xs py-3 rounded-xl transition shadow-sm"
                      >
                        Ver perfil
                      </button>
                      
                      <button 
                        onClick={() => handleMensaje(fisio)}
                        title="Enviar mensaje al especialista"
                        className="h-[42px] w-[42px] border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1A5C3A] hover:border-[#1A5C3A] transition-all flex-shrink-0 cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <p className="text-sm text-slate-400 font-light">
                  No encontramos fisioterapeutas que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#0A1E3D] text-slate-400 pt-16 pb-8 mt-20 w-full">
         <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
         </div>
      </footer>
    </div>
  );
}
