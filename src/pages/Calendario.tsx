import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar as CalendarIcon, MapPin, 
  Video, FileText, CheckCircle2, Save, AlertCircle 
} from 'lucide-react';

export default function Calendario() {
  const navigate = useNavigate();
  const [fisioId, setFisioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de la vista
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);
  const [rango, setRango] = useState<'dia' | 'semana'>('semana');
  const [citasList, setCitasList] = useState<any[]>([]);
  const [citaActiva, setCitaActiva] = useState<any>(null);

  // ESTADOS ESTRUCTURADOS PARA LAS NOTAS CLÍNICAS
  const [notaId, setNotaId] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [planTratamiento, setPlanTratamiento] = useState('');
  const [ejerciciosRecomendados, setEjerciciosRecomendados] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  
  // 🚀 NUEVO: ESTADO PARA EL LINK DE VIDEOLLAMADA
  const [linkVirtual, setLinkVirtual] = useState('');

  const [guardandoNota, setGuardandoNota] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    inicializar();
  }, []);

  useEffect(() => {
    if (fisioId) cargarCitas(fisioId, fechaSeleccionada, rango);
    setCitaActiva(null); 
  }, [fechaSeleccionada, rango]);

  useEffect(() => {
    if (citaActiva) {
      if (citaActiva.estado === 'completada') {
        cargarNotaClinica(citaActiva.id);
      } else {
        limpiarCamposNota();
      }
      // 🚀 Cargar el link si existe, o dejarlo vacío
      setLinkVirtual(citaActiva.link_videollamada || '');
    } else {
      limpiarCamposNota();
      setLinkVirtual('');
    }
  }, [citaActiva]);

  const inicializar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setFisioId(user.id);
    await cargarCitas(user.id, hoyStr, 'semana');
    setLoading(false);
  };

  const limpiarCamposNota = () => {
    setNotaId(null);
    setDiagnostico('');
    setPlanTratamiento('');
    setEjerciciosRecomendados('');
    setRecomendaciones('');
  };

  const cargarCitas = async (idFisio: string, fechaBase: string, rangoVista: string) => {
    try {
      let query = supabase
        .from('citas')
        .select(`*, pacientes ( id, nombre_completo, telefono )`)
        .eq('fisioterapeuta_id', idFisio)
        .neq('estado', 'cancelada')
        .order('fecha_cita', { ascending: true })
        .order('hora_cita', { ascending: true });

      if (rangoVista === 'dia') {
        query = query.eq('fecha_cita', fechaBase);
      } else {
        const parts = fechaBase.split('-');
        const fechaObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        fechaObj.setDate(fechaObj.getDate() + 7);
        const fechaFin = fechaObj.toISOString().split('T')[0];

        query = query.gte('fecha_cita', fechaBase).lte('fecha_cita', fechaFin);
      }

      const { data } = await query;
      if (data) setCitasList(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  const cargarNotaClinica = async (citaId: string) => {
    try {
      const { data } = await supabase
        .from('notas_clinicas') 
        .select('id, diagnostico, plan_tratamiento, ejercicios_recomendados, recomendaciones')
        .eq('cita_id', citaId)
        .maybeSingle();

      if (data) {
        setNotaId(data.id);
        setDiagnostico(data.diagnostico || '');
        setPlanTratamiento(data.plan_tratamiento || '');
        setEjerciciosRecomendados(data.ejercicios_recomendados || '');
        setRecomendaciones(data.recomendaciones || '');
      } else {
        limpiarCamposNota();
      }
    } catch (error) {
      console.error("Error cargando nota clínica:", error);
    }
  };

  const marcarComoCompletada = async (cita: any) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'completada' })
        .eq('id', cita.id);

      if (error) throw error;

      const citaActualizada = { ...cita, estado: 'completada' };
      setCitasList(prev => prev.map(c => c.id === cita.id ? citaActualizada : c));
      setCitaActiva(citaActualizada);
      
    } catch (error) {
      console.error("Error al completar cita:", error);
    }
  };

  const guardarNota = async () => {
    if (!citaActiva) return;
    setGuardandoNota(true);
    
    const payload = {
      cita_id: citaActiva.id,
      paciente_id: citaActiva.paciente_id,
      fisioterapeuta_id: fisioId,
      diagnostico: diagnostico,
      plan_tratamiento: planTratamiento,
      ejercicios_recomendados: ejerciciosRecomendados,
      recomendaciones: recomendaciones
    };

    try {
      if (notaId) {
        const { error } = await supabase
          .from('notas_clinicas')
          .update({
            diagnostico,
            plan_tratamiento: planTratamiento,
            ejercicios_recomendados: ejerciciosRecomendados,
            recomendaciones
          })
          .eq('id', notaId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('notas_clinicas')
          .insert([payload])
          .select()
          .single();
          
        if (error) throw error;
        if (data) setNotaId(data.id);
      }

      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
      
    } catch (error) {
      console.error("Error guardando nota clínica:", error);
      alert("Hubo un error al guardar los registros clínicos.");
    } finally {
      setGuardandoNota(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(Number(year), Number(month) - 1, Number(day));
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const citasAgrupadas = citasList.reduce((acc: any, cita) => {
    if (!acc[cita.fecha_cita]) acc[cita.fecha_cita] = [];
    acc[cita.fecha_cita].push(cita);
    return acc;
  }, {});

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
            <CalendarIcon className="h-5 w-5 text-[#1A5C3A]" /> Agenda y Notas Clínicas
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Selector y Lista agrupada */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button onClick={() => setRango('dia')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${rango === 'dia' ? 'bg-white shadow-sm text-[#1A5C3A]' : 'text-slate-500'}`}>1 Día</button>
              <button onClick={() => setRango('semana')} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${rango === 'semana' ? 'bg-white shadow-sm text-[#1A5C3A]' : 'text-slate-500'}`}>7 Días</button>
            </div>
            <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none text-slate-700 font-bold" />
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-[#0A1E3D] text-sm mb-4">Agenda Encontrada ({citasList.length})</h3>
            <div className="space-y-4 overflow-y-auto max-h-[480px] pr-1 scrollbar-thin">
              {Object.keys(citasAgrupadas).length > 0 ? (
                Object.keys(citasAgrupadas).map((fecha) => (
                  <div key={fecha} className="space-y-2">
                    <div className="bg-slate-50 px-3 py-1 rounded-md"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{formatearFecha(fecha)}</h4></div>
                    {citasAgrupadas[fecha].map((cita: any) => (
                      <button key={cita.id} onClick={() => setCitaActiva(cita)} className={`w-full text-left p-3.5 rounded-xl border transition-all ${citaActiva?.id === cita.id ? 'border-[#1A5C3A] bg-[#E8F5EE]' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-bold bg-white border px-1.5 py-0.5 rounded text-slate-600">{cita.hora_cita}</span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${cita.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>{cita.estado}</span>
                        </div>
                        <h4 className="font-bold text-[#0A1E3D] text-xs truncate">{cita.pacientes?.nombre_completo}</h4>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">No hay citas en esta selección.</div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Ficha Clínica Estructurada */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 min-h-[600px] flex flex-col">
          {!citaActiva ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><FileText className="h-8 w-8" /></div>
              <h3 className="text-sm font-bold text-[#0A1E3D]">Ficha del Paciente</h3>
              <p className="text-xs text-slate-400 max-w-xs">Selecciona un registro de la agenda izquierda para comenzar la gestión de atención.</p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col animate-fadeIn space-y-6">
              
              {/* Info Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-[#0A1E3D] text-white rounded-xl flex items-center justify-center font-bold text-base uppercase">{citaActiva.pacientes?.nombre_completo.charAt(0)}</div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0A1E3D] capitalize">{citaActiva.pacientes?.nombre_completo}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span>{citaActiva.fecha_cita} • {citaActiva.hora_cita}</span>
                      <span className="capitalize flex items-center gap-0.5">{citaActiva.modalidad === 'domicilio' ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />} {citaActiva.modalidad}</span>
                    </p>
                  </div>
                </div>
                {mensajeExito && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 animate-fadeIn"><CheckCircle2 className="h-3.5 w-3.5" /> Todo Guardado</span>
                )}
              </div>

              {/* Modo Pendiente vs Modo Completado */}
              {citaActiva.estado === 'programada' ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="h-14 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#0A1E3D]">Sesión en Proceso</h3>

                  {/* 🚀 NUEVO: INPUT PARA LINK DE VIDEOLLAMADA */}
                  {citaActiva.modalidad === 'videollamada' && (
                    <div className="w-full max-w-sm bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2 mb-4">
                      <label className="text-xs font-bold text-[#0A1E3D] uppercase tracking-wider block mb-2 text-left">
                        Enlace de la Videollamada (Zoom/Meet)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="https://zoom.us/j/..."
                          value={linkVirtual}
                          onChange={(e) => setLinkVirtual(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1A5C3A]"
                        />
                        <button 
                          onClick={async () => {
                            try {
                              await supabase.from('citas').update({ link_videollamada: linkVirtual }).eq('id', citaActiva.id);
                              // Actualizar el estado local para que se refleje inmediatamente
                              const citaActualizada = { ...citaActiva, link_videollamada: linkVirtual };
                              setCitasList(prev => prev.map(c => c.id === citaActiva.id ? citaActualizada : c));
                              setCitaActiva(citaActualizada);
                              alert('Enlace guardado. El paciente ya puede acceder a la sala.');
                            } catch (e) {
                              alert('Error al guardar el enlace');
                            }
                          }}
                          className="bg-[#0A1E3D] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#122d5a] transition"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Al finalizar la sesión fisioterapéutica con el paciente, haz clic en el botón de abajo para darla por concluida y habilitar la redacción de la historia clínica.
                  </p>
                  <button onClick={() => marcarComoCompletada(citaActiva)} className="bg-[#1A5C3A] hover:bg-[#124229] text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> Finalizar y Completar Cita
                  </button>
                </div>
              ) : (
                // LOS 4 BLOQUES CLÍNICOS ESTRUCTURADOS
                <div className="flex-grow flex flex-col space-y-4">
                  
                  {/* 1. Diagnóstico */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#0A1E3D] uppercase tracking-wider block">1. Diagnóstico y Evolución Física</label>
                    <textarea 
                      value={diagnostico} 
                      onChange={(e) => setDiagnostico(e.target.value)}
                      placeholder="Ej: Paciente refiere dolor en la zona lumbar baja. Movilidad reducida en flexión..."
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition h-20 resize-none"
                    />
                  </div>

                  {/* 2. Plan de Tratamiento */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#0A1E3D] uppercase tracking-wider block">2. Plan de Tratamiento Realizado</label>
                    <textarea 
                      value={planTratamiento} 
                      onChange={(e) => setPlanTratamiento(e.target.value)}
                      placeholder="Ej: Sesión 2 de 5. Aplicación de termoterapia por 15 min seguida de terapia manual guiada..."
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition h-20 resize-none"
                    />
                  </div>

                  {/* 3. Ejercicios Recomendados */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#0A1E3D] uppercase tracking-wider block">3. Ejercicios Recomendados para Casa</label>
                    <textarea 
                      value={ejerciciosRecomendados} 
                      onChange={(e) => setEjerciciosRecomendados(e.target.value)}
                      placeholder="Ej: Realizar puentes de glúteo (3 series de 10 repeticiones) y estiramiento de gato-camello diariamente..."
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition h-20 resize-none"
                    />
                  </div>

                  {/* 4. Recomendaciones Generales */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#0A1E3D] uppercase tracking-wider block">4. Recomendaciones Generales</label>
                    <textarea 
                      value={recomendaciones} 
                      onChange={(e) => setRecomendaciones(e.target.value)}
                      placeholder="Ej: Evitar cargar peso mayor a 5kg. Colocar compresas calientes si aparece rigidez por las mañanas..."
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition h-20 resize-none"
                    />
                  </div>

                  {/* Botón de Guardado */}
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={guardarNota}
                      disabled={guardandoNota}
                      className="bg-[#0A1E3D] hover:bg-[#122d5a] text-white px-5 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {guardandoNota ? (
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <><Save className="h-4 w-4" /> Guardar Ficha Médica</>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
