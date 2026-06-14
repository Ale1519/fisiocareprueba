import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calendar, Clock, MapPin, Video, User, Plus, FileText, ChevronRight, 
  X, AlertTriangle, CheckCircle2, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';

export default function DashboardPaciente() {
  const [paciente, setPaciente] = useState<any>(null);
  const [citasProgramadas, setCitasProgramadas] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🚀 NUEVO: Estado para controlar si mostramos 2 o todas las citas
  const [mostrarTodasCitas, setMostrarTodasCitas] = useState(false);

  // === ESTADOS PARA EL MODAL DE ACCIÓN ===
  const [modalOpen, setModalOpen] = useState(false);
  const [pasoModal, setPasoModal] = useState<'menu' | 'cancelar' | 'reprogramar'>('menu');
  const [procesando, setProcesando] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  
  // Estados para reprogramar
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  const horariosDisponibles = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dataPaciente } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setPaciente(dataPaciente || { nombre_completo: user.email?.split('@')[0] });

      const { data: citas } = await supabase
        .from('citas')
        .select(`
          *,
          fisioterapeutas ( nombres, apellidos )
        `)
        .eq('paciente_id', user.id)
        .order('fecha_cita', { ascending: true })
        .order('hora_cita', { ascending: true });

      if (citas) {
        const programadas = citas.filter(c => c.estado === 'programada' || c.estado === 'agendada');
        const pasadas = citas.filter(c => c.estado !== 'programada' && c.estado !== 'agendada');

        setCitasProgramadas(programadas);
        setHistorial(pasadas);
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(Number(year), Number(month) - 1, Number(day));
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const confirmarCancelacion = async () => {
    if (!citaSeleccionada) return;
    setProcesando(true);
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('id', citaSeleccionada.id);
      
      if (error) throw error;
      
      await cargarDatosDashboard();
      setModalOpen(false);
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("Hubo un error al cancelar la cita.");
    } finally {
      setProcesando(false);
    }
  };

  const confirmarReprogramacion = async () => {
    if (!citaSeleccionada || !nuevaFecha || !nuevaHora) return;
    setProcesando(true);
    try {
      const { error } = await supabase
        .from('citas')
        .update({ 
          fecha_cita: nuevaFecha, 
          hora_cita: nuevaHora 
        })
        .eq('id', citaSeleccionada.id);
      
      if (error) throw error;
      
      await cargarDatosDashboard();
      setModalOpen(false);
      
      setNuevaFecha('');
      setNuevaHora('');
    } catch (error) {
      console.error("Error al reprogramar:", error);
      alert("Hubo un error al reprogramar la cita.");
    } finally {
      setProcesando(false);
    }
  };

  const abrirModalCita = (cita: any) => {
    setCitaSeleccionada(cita);
    setPasoModal('menu');
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A5C3A]"></div>
      </div>
    );
  }

  const hoyStr = new Date().toISOString().split('T')[0];
  
  // 🚀 LÓGICA PARA CORTAR LA LISTA A 2 CITAS
  const citasAMostrar = mostrarTodasCitas ? citasProgramadas : citasProgramadas.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0A1E3D]">
            Hola, <span className="text-[#1A5C3A] capitalize">{paciente?.nombre_completo?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">Aquí está el resumen de tu tratamiento y reservas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA PRINCIPAL (Izquierda) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SECCIÓN: PRÓXIMAS CITAS */}
            <section>
              <h2 className="text-lg font-bold text-[#0A1E3D] mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1A5C3A]" /> Tus próximas citas
              </h2>
              
              {citasProgramadas.length > 0 ? (
                <div className="space-y-4">
                  
                  {/* RENDERIZAMOS SOLO LAS CITAS A MOSTRAR (2 o todas) */}
                  {citasAMostrar.map((cita) => (
                    <div key={cita.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md animate-fadeIn">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1A6645] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                          {cita.modalidad === 'domicilio' ? <MapPin className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                          {cita.modalidad === 'domicilio' ? 'A Domicilio' : 'Videollamada'}
                        </div>
                        
                        <div>
                          <h3 className="text-xl md:text-2xl font-extrabold text-[#0A1E3D] capitalize">
                            {formatearFecha(cita.fecha_cita)}
                          </h3>
                          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4" /> {cita.hora_cita} hrs (50 min)
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Especialista</p>
                            <p className="text-sm font-bold text-[#0A1E3D]">
                              {cita.fisioterapeutas?.nombres} {cita.fisioterapeutas?.apellidos}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[160px]">
                        {cita.modalidad === 'videollamada' ? (
                          <button className="w-full bg-[#1A5C3A] hover:bg-[#124229] text-white px-5 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2">
                            <Video className="h-4 w-4" /> Entrar a sala
                          </button>
                        ) : (
                          <div className="w-full bg-slate-50 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm text-center border border-slate-200 flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Confirmada
                          </div>
                        )}
                        
                        <button 
                          onClick={() => abrirModalCita(cita)}
                          className="w-full text-slate-400 hover:text-[#0A1E3D] font-semibold text-xs transition"
                        >
                          Reprogramar o cancelar
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 🚀 BOTÓN PARA VER MÁS O VER MENOS */}
                  {citasProgramadas.length > 2 && (
                    <button 
                      onClick={() => setMostrarTodasCitas(!mostrarTodasCitas)}
                      className="w-full py-4 rounded-3xl border border-dashed border-slate-300 text-slate-500 font-bold hover:bg-slate-50 hover:text-[#1A5C3A] hover:border-[#1A5C3A] transition flex items-center justify-center gap-2"
                    >
                      {mostrarTodasCitas ? (
                        <>Ver menos citas <ChevronUp className="h-5 w-5" /></>
                      ) : (
                        <>Ver todas mis citas programadas ({citasProgramadas.length}) <ChevronDown className="h-5 w-5" /></>
                      )}
                    </button>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[#0A1E3D] font-bold">No tienes citas programadas</p>
                    <p className="text-sm text-slate-500 mt-1">Es un buen momento para continuar tu recuperación.</p>
                  </div>
                  <Link to="/especialistas" className="mt-2 bg-[#0A1E3D] hover:bg-[#1E3A5F] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">
                    Agendar una sesión
                  </Link>
                </div>
              )}
            </section>

            {/* SECCIÓN: HISTORIAL RECIENTE */}
            <section>
              <h2 className="text-lg font-bold text-[#0A1E3D] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" /> Historial de atenciones
              </h2>
              
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {historial.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {historial.map((cita) => (
                      <div key={cita.id} className="p-5 hover:bg-slate-50 transition flex items-center justify-between group">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <p className="font-bold text-[#0A1E3D] w-32">{cita.fecha_cita}</p>
                          <p className="text-sm text-slate-500">
                            Fisio. {cita.fisioterapeutas?.nombres} • <span className="capitalize">{cita.modalidad}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md capitalize ${
                            cita.estado === 'completada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {cita.estado}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1A5C3A] transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Aún no tienes atenciones pasadas en tu historial.
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* COLUMNA LATERAL (Derecha) */}
          <div className="space-y-6">
            
            {/* ACCIONES RÁPIDAS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-[#0A1E3D] mb-4">Acciones rápidas</h3>
              <div className="space-y-3">
                <Link to="/especialistas" className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 group-hover:bg-white p-2 rounded-lg transition">
                      <Plus className="h-4 w-4 text-[#1A5C3A]" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D] transition">Nueva reserva</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1A5C3A] transition" />
                </Link>
                
                <Link to="/perfil-paciente" className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 group-hover:bg-white p-2 rounded-lg transition">
                      <User className="h-4 w-4 text-slate-500 group-hover:text-[#1A5C3A] transition" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D] transition">Mi perfil y datos</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1A5C3A] transition" />
                </Link>

                <Link to="/mensajeria" className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 group-hover:bg-white p-2 rounded-lg transition">
                      <MessageSquare className="h-4 w-4 text-slate-500 group-hover:text-[#1A5C3A] transition" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D] transition">Mensajes</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1A5C3A] transition" />
                </Link>
              </div>
            </div>

            {/* TARJETA DE SOPORTE */}
            <div className="bg-[#0A1E3D] rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-white opacity-5 rounded-full blur-2xl"></div>
              <h3 className="font-bold mb-2 relative z-10">¿Necesitas ayuda?</h3>
              <p className="text-xs text-slate-300 mb-4 relative z-10">Si tienes dudas sobre tu tratamiento o un problema técnico, contáctanos.</p>
              <button className="bg-white/10 hover:bg-white/20 text-white w-full py-2.5 rounded-xl text-sm font-bold transition relative z-10">
                Soporte FisioCare
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL PARA REPROGRAMAR / CANCELAR                         */}
      {/* ========================================================= */}
      {modalOpen && citaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn slide-down">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#0A1E3D]">
                {pasoModal === 'menu' && 'Gestionar Cita'}
                {pasoModal === 'cancelar' && 'Cancelar Cita'}
                {pasoModal === 'reprogramar' && 'Reprogramar Cita'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* PASO 1 */}
            {pasoModal === 'menu' && (
              <div className="p-6 space-y-4">
                <p className="text-slate-500 text-sm mb-2">¿Qué deseas hacer con tu cita agendada para el <strong className="text-slate-700">{citaSeleccionada.fecha_cita} a las {citaSeleccionada.hora_cita}</strong>?</p>
                
                <button 
                  onClick={() => setPasoModal('reprogramar')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600 group-hover:scale-105 transition-transform"><Calendar className="h-5 w-5" /></div>
                    <div className="text-left">
                      <p className="font-bold text-[#0A1E3D]">Reprogramar fecha/hora</p>
                      <p className="text-xs text-slate-500">Mantener la cita para otro momento.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-300" />
                </button>

                <button 
                  onClick={() => setPasoModal('cancelar')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-red-500 group-hover:scale-105 transition-transform"><AlertTriangle className="h-5 w-5" /></div>
                    <div className="text-left">
                      <p className="font-bold text-red-700">Cancelar cita</p>
                      <p className="text-xs text-red-400/80">No podré asistir a la cita.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-300" />
                </button>
              </div>
            )}

            {/* PASO 2 */}
            {pasoModal === 'cancelar' && (
              <div className="p-6 text-center space-y-6">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#0A1E3D]">¿Estás seguro?</h4>
                  <p className="text-sm text-slate-500 mt-2">Esta acción no se puede deshacer. Se notificará a tu especialista sobre la cancelación.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setPasoModal('menu')} disabled={procesando}
                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Volver
                  </button>
                  <button 
                    onClick={confirmarCancelacion} disabled={procesando}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    {procesando ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sí, cancelar'}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {pasoModal === 'reprogramar' && (
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nueva Fecha</label>
                    <input 
                      type="date" 
                      min={hoyStr}
                      value={nuevaFecha} 
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition text-slate-700 font-medium"
                    />
                  </div>

                  {nuevaFecha && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Horarios Disponibles</label>
                      <div className="grid grid-cols-3 gap-2">
                        {horariosDisponibles.map(hora => (
                          <button
                            key={hora}
                            onClick={() => setNuevaHora(hora)}
                            className={`py-2.5 rounded-lg text-sm font-bold border transition ${
                              nuevaHora === hora 
                                ? 'bg-[#1A5C3A] text-white border-[#1A5C3A] shadow-md shadow-[#1A5C3A]/20' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#1A5C3A] hover:text-[#1A5C3A]'
                            }`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setPasoModal('menu')} disabled={procesando}
                    className="w-1/3 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Atrás
                  </button>
                  <button 
                    onClick={confirmarReprogramacion} 
                    disabled={procesando || !nuevaFecha || !nuevaHora}
                    className="w-2/3 py-3.5 rounded-xl font-bold text-white bg-[#1A5C3A] hover:bg-[#124229] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {procesando ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirmar nuevo horario'}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
