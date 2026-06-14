import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, User, Phone, Calendar, 
  FileText, Activity, ChevronDown, ChevronUp, Clock 
} from 'lucide-react';

export default function Pacientes() {
  const navigate = useNavigate();
  const [fisioId, setFisioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [pacienteActivo, setPacienteActivo] = useState<any>(null);
  const [historialActivo, setHistorialActivo] = useState<any[]>([]);
  const [citaExpandida, setCitaExpandida] = useState<string | null>(null);

  useEffect(() => {
    cargarPacientesUnicos();
  }, []);

  useEffect(() => {
    if (pacienteActivo && fisioId) {
      cargarHistorialPaciente(pacienteActivo.id);
    }
  }, [pacienteActivo]);

  const cargarPacientesUnicos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setFisioId(user.id);

    try {
      // Traemos todas las citas para extraer los pacientes únicos
      const { data: citas } = await supabase
        .from('citas')
        .select(`
          fecha_cita,
          pacientes ( id, nombre_completo, telefono )
        `)
        .eq('fisioterapeuta_id', user.id)
        .order('fecha_cita', { ascending: false });

      if (citas) {
        const mapaPacientes = new Map();
        
        citas.forEach((cita: any) => {
          const p = cita.pacientes;
          if (p && !mapaPacientes.has(p.id)) {
            mapaPacientes.set(p.id, {
              id: p.id,
              nombre_completo: p.nombre_completo,
              telefono: p.telefono,
              ultima_cita: cita.fecha_cita
            });
          }
        });

        setPacientes(Array.from(mapaPacientes.values()));
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorialPaciente = async (pacienteId: string) => {
    try {
      // Traemos las citas completadas junto con sus notas clínicas
      const { data } = await supabase
        .from('citas')
        .select(`
          id, fecha_cita, hora_cita, modalidad,
          notas_clinicas ( diagnostico, plan_tratamiento, ejercicios_recomendados, recomendaciones )
        `)
        .eq('fisioterapeuta_id', fisioId)
        .eq('paciente_id', pacienteId)
        .eq('estado', 'completada')
        .order('fecha_cita', { ascending: false });

      setHistorialActivo(data || []);
      // Expandir automáticamente la cita más reciente
      if (data && data.length > 0) {
        setCitaExpandida(data[0].id);
      } else {
        setCitaExpandida(null);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  const toggleCita = (citaId: string) => {
    setCitaExpandida(prev => prev === citaId ? null : citaId);
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(Number(year), Number(month) - 1, Number(day));
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A5C3A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col pb-12">
      
      {/* HEADER TOP */}
      <div className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/dashboard-fisio" className="flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] font-bold text-sm transition">
            <ArrowLeft className="h-4 w-4" /> Volver al Panel
          </Link>
          <div className="font-display font-bold text-lg text-[#0A1E3D] flex items-center gap-2">
            <User className="h-5 w-5 text-[#1A5C3A]" /> Mis Pacientes
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Directorio de Pacientes */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
            <div className="relative mb-4">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#1A5C3A] transition"
              />
            </div>
            
            <h3 className="font-bold text-[#0A1E3D] text-sm mb-3">Directorio ({pacientesFiltrados.length})</h3>
            
            <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1 scrollbar-thin">
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((paciente) => (
                  <button
                    key={paciente.id}
                    onClick={() => setPacienteActivo(paciente)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      pacienteActivo?.id === paciente.id 
                        ? 'border-[#1A5C3A] bg-[#E8F5EE] shadow-sm' 
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <h4 className="font-bold text-[#0A1E3D] text-sm truncate capitalize">{paciente.nombre_completo}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Última cita: {paciente.ultima_cita}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">
                  No se encontraron pacientes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Ficha Clínica y Línea de Tiempo */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 min-h-[650px] flex flex-col">
          {!pacienteActivo ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-[#0A1E3D]">Historial Clínico</h3>
              <p className="text-xs text-slate-400 max-w-xs">Selecciona un paciente del directorio para visualizar toda su evolución y notas de tratamiento.</p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col animate-fadeIn">
              
              {/* Info Header del Paciente */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="h-14 w-14 bg-[#0A1E3D] text-white rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                  {pacienteActivo.nombre_completo.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0A1E3D] capitalize">{pacienteActivo.nombre_completo}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    {pacienteActivo.telefono && (
                      <a href={`https://wa.me/${pacienteActivo.telefono}`} target="_blank" rel="noreferrer" className="text-sm text-[#1A5C3A] font-medium flex items-center gap-1 hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {pacienteActivo.telefono}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* TIMELINE DE SESIONES */}
              <div className="mt-6 space-y-6">
                <h3 className="font-bold text-[#0A1E3D] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#1A5C3A]" /> Historial de Sesiones Completadas
                </h3>

                {historialActivo.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                    <p className="text-sm text-slate-500">Este paciente aún no tiene sesiones marcadas como completadas.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                    {historialActivo.map((cita) => {
                      // Adaptar para cuando Supabase devuelve un objeto o un arreglo
                      const notas = Array.isArray(cita.notas_clinicas) ? cita.notas_clinicas[0] : cita.notas_clinicas;
                      const estaExpandida = citaExpandida === cita.id;

                      return (
                        <div key={cita.id} className="relative pl-6">
                          {/* Punto del Timeline */}
                          <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-4 border-[#1A5C3A]"></div>
                          
                          {/* Tarjeta de la Sesión */}
                          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden transition-all">
                            {/* Cabecera (Clickable) */}
                            <button 
                              onClick={() => toggleCita(cita.id)}
                              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition"
                            >
                              <div className="text-left">
                                <h4 className="font-bold text-[#0A1E3D] capitalize">{formatearFecha(cita.fecha_cita)}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  <Clock className="h-3 w-3" /> {cita.hora_cita} • <span className="capitalize">{cita.modalidad}</span>
                                </p>
                              </div>
                              <div className="text-slate-400 bg-slate-100 p-1.5 rounded-lg">
                                {estaExpandida ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </button>

                            {/* Contenido Expandible (Notas Clínicas) */}
                            {estaExpandida && (
                              <div className="p-5 border-t border-slate-100 space-y-4 text-sm bg-[#F8FAF9]">
                                {!notas ? (
                                  <p className="text-slate-500 italic text-xs">No se registraron notas clínicas para esta sesión.</p>
                                ) : (
                                  <>
                                    {notas.diagnostico && (
                                      <div>
                                        <h5 className="font-extrabold text-[#0A1E3D] text-[11px] uppercase tracking-wider mb-1">Diagnóstico y Evolución</h5>
                                        <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{notas.diagnostico}</p>
                                      </div>
                                    )}
                                    {notas.plan_tratamiento && (
                                      <div>
                                        <h5 className="font-extrabold text-[#0A1E3D] text-[11px] uppercase tracking-wider mb-1">Plan de Tratamiento</h5>
                                        <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{notas.plan_tratamiento}</p>
                                      </div>
                                    )}
                                    {notas.ejercicios_recomendados && (
                                      <div>
                                        <h5 className="font-extrabold text-[#0A1E3D] text-[11px] uppercase tracking-wider mb-1">Ejercicios Recomendados</h5>
                                        <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{notas.ejercicios_recomendados}</p>
                                      </div>
                                    )}
                                    {notas.recomendaciones && (
                                      <div>
                                        <h5 className="font-extrabold text-[#0A1E3D] text-[11px] uppercase tracking-wider mb-1">Recomendaciones</h5>
                                        <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{notas.recomendaciones}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
