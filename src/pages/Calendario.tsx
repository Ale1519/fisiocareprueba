import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, 
  Video, FileText, CheckCircle2, Save, AlertCircle 
} from 'lucide-react';

export default function Calendario() {
  const navigate = useNavigate();
  const [fisioId, setFisioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de la vista
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);
  const [citasDelDia, setCitasDelDia] = useState<any[]>([]);
  const [citaActiva, setCitaActiva] = useState<any>(null);

  // Estados para las Notas Clínicas
  const [notaId, setNotaId] = useState<string | null>(null);
  const [contenidoNota, setContenidoNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    inicializar();
  }, []);

  // Volver a cargar las citas cuando cambie la fecha
  useEffect(() => {
    if (fisioId) cargarCitasPorFecha(fisioId, fechaSeleccionada);
    setCitaActiva(null); // Resetear detalle al cambiar de día
  }, [fechaSeleccionada]);

  // Cargar nota clínica cuando se selecciona una cita completada
  useEffect(() => {
    if (citaActiva && citaActiva.estado === 'completada') {
      cargarNotaClinica(citaActiva.id);
    } else {
      setContenidoNota('');
      setNotaId(null);
    }
  }, [citaActiva]);

  const inicializar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setFisioId(user.id);
    await cargarCitasPorFecha(user.id, fechaSeleccionada);
    setLoading(false);
  };

  const cargarCitasPorFecha = async (idFisio: string, fecha: string) => {
    try {
      const { data } = await supabase
        .from('citas')
        .select(`
          *,
          pacientes ( id, nombre_completo, telefono )
        `)
        .eq('fisioterapeuta_id', idFisio)
        .eq('fecha_cita', fecha)
        .neq('estado', 'cancelada')
        .order('hora_cita', { ascending: true });

      if (data) setCitasDelDia(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  const cargarNotaClinica = async (citaId: string) => {
    try {
      const { data } = await supabase
        .from('notas_clinicas')
        .select('*')
        .eq('cita_id', citaId)
        .maybeSingle();

      if (data) {
        setNotaId(data.id);
        setContenidoNota(data.contenido);
      } else {
        setNotaId(null);
        setContenidoNota('');
      }
    } catch (error) {
      console.error("Error cargando nota:", error);
    }
  };

  // Cambiar estado de Programada -> Completada
  const marcarComoCompletada = async (cita: any) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'completada' })
        .eq('id', cita.id);

      if (error) throw error;

      // Actualizar UI localmente
      const citaActualizada = { ...cita, estado: 'completada' };
      setCitasDelDia(prev => prev.map(c => c.id === cita.id ? citaActualizada : c));
      setCitaActiva(citaActualizada);
      
    } catch (error) {
      console.error("Error al completar cita:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  // Guardar o actualizar la Nota Clínica en la base de datos
  const guardarNota = async () => {
    if (!citaActiva || !contenidoNota.trim()) return;
    setGuardandoNota(true);
    
    try {
      if (notaId) {
        // Actualizar nota existente
        const { error } = await supabase
          .from('notas_clinicas')
          .update({ contenido: contenidoNota })
          .eq('id', notaId);
        if (error) throw error;
      } else {
        // Crear nota nueva
        const { data, error } = await supabase
          .from('notas_clinicas')
          .insert([{
            cita_id: citaActiva.id,
            paciente_id: citaActiva.paciente_id,
            fisioterapeuta_id: fisioId,
            contenido: contenidoNota
          }])
          .select()
          .single();
          
        if (error) throw error;
        if (data) setNotaId(data.id);
      }

      // Mostrar mensaje temporal de éxito
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
      
    } catch (error) {
      console.error("Error guardando nota:", error);
      alert("Hubo un error al guardar la nota clínica.");
    } finally {
      setGuardandoNota(false);
    }
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
            <CalendarIcon className="h-5 w-5 text-[#1A5C3A]" /> Calendario y Notas Clínicas
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Selector de Fecha y Lista de Citas */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-[#0A1E3D] mb-4">Seleccionar Fecha</h3>
            <input 
              type="date" 
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] transition text-slate-700 font-bold"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-[#0A1E3D] mb-4 flex justify-between items-center">
              <span>Citas de este día</span>
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">{citasDelDia.length}</span>
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-thin pr-1">
              {citasDelDia.length > 0 ? (
                citasDelDia.map(cita => (
                  <button
                    key={cita.id}
                    onClick={() => setCitaActiva(cita)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      citaActiva?.id === cita.id 
                        ? 'border-[#1A5C3A] bg-[#E8F5EE] shadow-sm' 
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                        citaActiva?.id === cita.id ? 'bg-white border-[#1A5C3A]/20 text-[#1A5C3A]' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        {cita.hora_cita}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                        cita.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {cita.estado}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#0A1E3D] text-sm truncate">{cita.pacientes?.nombre_completo}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 capitalize">
                      {cita.modalidad === 'domicilio' ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      {cita.modalidad}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-slate-400 text-sm">No tienes citas agendadas para este día.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Detalle y Notas Clínicas */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
          {!citaActiva ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <FileText className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0A1E3D]">Panel de Detalles</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">Selecciona una cita de la lista izquierda para gestionar su estado o redactar la nota clínica.</p>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col animate-fadeIn">
              
              {/* Resumen del Paciente (Header) */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="h-16 w-16 bg-[#0A1E3D] text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                  {citaActiva.pacientes?.nombre_completo.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0A1E3D]">{citaActiva.pacientes?.nombre_completo}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {citaActiva.hora_cita}</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1 capitalize">
                      {citaActiva.modalidad === 'domicilio' ? <MapPin className="h-4 w-4" /> : <Video className="h-4 w-4" />} 
                      {citaActiva.modalidad}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTENIDO DINÁMICO SEGÚN ESTADO */}
              {citaActiva.estado === 'programada' ? (
                
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-5 py-12">
                  <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1E3D]">Cita Pendiente</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                      Esta cita aún no ha finalizado. Una vez que hayas terminado la sesión con el paciente, márcala como completada para habilitar el historial de notas clínicas.
                    </p>
                  </div>
                  <button 
                    onClick={() => marcarComoCompletada(citaActiva)}
                    className="mt-4 bg-[#1A5C3A] hover:bg-[#124229] text-white px-8 py-3.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="h-5 w-5" /> Marcar sesión como completada
                  </button>
                </div>

              ) : (

                <div className="flex-grow flex flex-col pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#0A1E3D] flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#1A5C3A]" /> Historial y Notas Clínicas
                    </h3>
                    {mensajeExito && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 animate-fadeIn">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Guardado
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Registra aquí la evolución del paciente, tratamientos aplicados, nivel de dolor reportado y recomendaciones para la próxima sesión. Esta nota es privada y exclusiva para tu gestión.
                  </p>

                  <textarea
                    value={contenidoNota}
                    onChange={(e) => setContenidoNota(e.target.value)}
                    placeholder="Escribe la nota clínica del paciente aquí..."
                    className="flex-grow w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition resize-none min-h-[250px]"
                  ></textarea>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={guardarNota}
                      disabled={!contenidoNota.trim() || guardandoNota}
                      className="bg-[#0A1E3D] hover:bg-[#122d5a] text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {guardandoNota ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <><Save className="h-4 w-4" /> Guardar Nota Clínica</>
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
