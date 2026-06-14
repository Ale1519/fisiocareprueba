import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calendar, Clock, MapPin, Video, Users, DollarSign, 
  TrendingUp, CheckCircle, FileText, ChevronRight, UserCircle,
  MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';

export default function DashboardFisio() {
  const [fisio, setFisio] = useState<any>(null);
  
  // Arreglos de citas
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [proximasCitas, setProximasCitas] = useState<any[]>([]);
  const [historialCitas, setHistorialCitas] = useState<any[]>([]); // 🚀 NUEVO: Historial
  
  // Estados para los acordeones
  const [mostrarTodasProximas, setMostrarTodasProximas] = useState(false);
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const obtenerMes = (fechaStr: string) => {
    if (!fechaStr) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesIndex = parseInt(fechaStr.split('-')[1], 10) - 1;
    return meses[mesIndex];
  };

  useEffect(() => {
    cargarDatosFisio();
  }, []);

  const cargarDatosFisio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dataFisio } = await supabase
        .from('fisioterapeutas')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setFisio(dataFisio);

      const { data: citas } = await supabase
        .from('citas')
        .select(`
          *,
          pacientes ( nombre_completo, telefono )
        `)
        .eq('fisioterapeuta_id', user.id)
        .order('fecha_cita', { ascending: true })
        .order('hora_cita', { ascending: true });

      if (citas) {
        const hoy = new Date().toISOString().split('T')[0];
        
        const hoyCitas = citas.filter(c => c.fecha_cita === hoy && c.estado === 'programada');
        const futurasCitas = citas.filter(c => c.fecha_cita > hoy && c.estado === 'programada');
        const pasadasCitas = citas.filter(c => c.estado === 'completada' || c.estado === 'cancelada').reverse(); // Las más recientes primero

        setCitasHoy(hoyCitas);
        setProximasCitas(futurasCitas);
        setHistorialCitas(pasadasCitas);
      }
    } catch (error) {
      console.error("Error cargando dashboard de fisio:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoCita = async (citaId: string, nuevoEstado: 'completada' | 'cancelada') => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('id', citaId);

      if (error) throw error;

      // Recargar datos para que se muevan automáticamente a la sección de historial
      await cargarDatosFisio();
      
    } catch (error) {
      console.error(`Error al marcar como ${nuevoEstado}:`, error);
      alert('Hubo un error al actualizar la cita. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A1E3D]"></div>
      </div>
    );
  }

  // 🚀 Lógica para cortar las listas a 2 elementos
  const proximasAMostrar = mostrarTodasProximas ? proximasCitas : proximasCitas.slice(0, 2);
  const historialAMostrar = mostrarTodoHistorial ? historialCitas : historialCitas.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HEADER DEL DASHBOARD */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A1E3D] flex items-center gap-3">
              Hola, {fisio?.nombres} 👋
            </h1>
            <p className="text-slate-500 mt-1">Aquí está el resumen de tu clínica digital para hoy.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Perfil Activo
            </span>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS (KPIs) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pacientes Hoy', value: citasHoy.length.toString(), icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'Citas Próximas', value: proximasCitas.length.toString(), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Ingresos Estimados', value: `S/ ${(citasHoy.length + proximasCitas.length) * (fisio?.precio_sesion || 0)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Tasa de Retención', value: '85%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-[#0A1E3D] mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA PRINCIPAL: AGENDA Y OPERACIONES */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AGENDA DE HOY */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1A5C3A]" /> Agenda de Hoy
                </h2>
              </div>

              {citasHoy.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {citasHoy.map((cita) => (
                    <div key={cita.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#0A1E3D] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {cita.modalidad === 'domicilio' ? <MapPin className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 border border-slate-200 p-4 rounded-2xl group-hover:border-[#1A5C3A] group-hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold bg-white px-2 py-1 rounded-md text-slate-600 border border-slate-200 shadow-sm">
                            {cita.hora_cita}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {cita.modalidad}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#0A1E3D] text-base">{cita.pacientes?.nombre_completo}</h4>
                        {cita.modalidad === 'domicilio' && (
                          <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" /> {cita.direccion_exacta || 'Dirección pendiente'}
                          </p>
                        )}
                        
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => cambiarEstadoCita(cita.id, 'completada')}
                            className="flex-1 bg-[#1A5C3A] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#124229] transition flex justify-center gap-1"
                          >
                            ✓ Completar
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('¿Estás seguro de cancelar esta cita?')) {
                                cambiarEstadoCita(cita.id, 'cancelada');
                              }
                            }}
                            className="px-3 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">No tienes citas pendientes para hoy.</p>
                </div>
              )}
            </section>

            {/* 🚀 PRÓXIMAS RESERVAS (Expandible) */}
            <section>
              <h2 className="text-lg font-bold text-[#0A1E3D] mb-4">Próximas Reservas</h2>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {proximasCitas.length > 0 ? (
                  <div className="space-y-0">
                    <div className="divide-y divide-slate-100">
                      {proximasAMostrar.map((cita) => (
                        <div key={cita.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-[#F4F7FB] rounded-xl flex flex-col items-center justify-center text-[#0A1E3D]">
                              <span className="text-xs font-bold">{cita.fecha_cita.split('-')[2]}</span>
                              <span className="text-[10px] uppercase">{obtenerMes(cita.fecha_cita)}</span>
                            </div>
                            <div>
                              <p className="font-bold text-[#0A1E3D]">{cita.pacientes?.nombre_completo}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {cita.hora_cita} • <span className="capitalize">{cita.modalidad}</span>
                              </p>
                            </div>
                          </div>
                          <button className="text-[#1A5C3A] hover:bg-[#E8F5EE] p-2 rounded-lg transition">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {proximasCitas.length > 2 && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <button 
                          onClick={() => setMostrarTodasProximas(!mostrarTodasProximas)}
                          className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 font-bold hover:bg-white hover:text-[#1A5C3A] transition flex items-center justify-center gap-2 text-sm"
                        >
                          {mostrarTodasProximas ? (
                            <>Ver menos <ChevronUp className="h-4 w-4" /></>
                          ) : (
                            <>Ver todas ({proximasCitas.length}) <ChevronDown className="h-4 w-4" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No hay reservas próximas por el momento.
                  </div>
                )}
              </div>
            </section>

            {/* 🚀 NUEVO: HISTORIAL DE CITAS PASADAS (Expandible) */}
            <section>
              <h2 className="text-lg font-bold text-[#0A1E3D] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" /> Historial de Atenciones
              </h2>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {historialCitas.length > 0 ? (
                  <div className="space-y-0">
                    <div className="divide-y divide-slate-100">
                      {historialAMostrar.map((cita) => (
                        <div key={cita.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500">
                              <span className="text-xs font-bold">{cita.fecha_cita.split('-')[2]}</span>
                              <span className="text-[10px] uppercase">{obtenerMes(cita.fecha_cita)}</span>
                            </div>
                            <div>
                              <p className="font-bold text-[#0A1E3D]">{cita.pacientes?.nombre_completo}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                                  cita.estado === 'completada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {cita.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botón que lleva al calendario para ver/editar la nota clínica */}
                          <Link 
                            to="/calendario" 
                            className="text-xs font-bold text-[#1A5C3A] hover:bg-[#E8F5EE] px-3 py-2 rounded-lg transition border border-[#1A5C3A]/20"
                          >
                            Ver nota
                          </Link>
                        </div>
                      ))}
                    </div>

                    {historialCitas.length > 2 && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <button 
                          onClick={() => setMostrarTodoHistorial(!mostrarTodoHistorial)}
                          className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 font-bold hover:bg-white hover:text-[#1A5C3A] transition flex items-center justify-center gap-2 text-sm"
                        >
                          {mostrarTodoHistorial ? (
                            <>Ver menos <ChevronUp className="h-4 w-4" /></>
                          ) : (
                            <>Ver historial completo ({historialCitas.length}) <ChevronDown className="h-4 w-4" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Aún no tienes atenciones registradas en el historial.
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* COLUMNA LATERAL: GESTIÓN */}
          <div className="space-y-6">
            
            {/* 🚀 NUEVO: MENÚ DE GESTIÓN REORGANIZADO */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-[#0A1E3D] mb-4">Gestión</h3>
              <div className="space-y-3">
                
                {/* 1. Agenda y Notas Clínicas */}
                <Link to="/calendario" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D]">Agenda y Notas Clínicas</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>

                {/* 2. Mensajería */}
                <Link to="/mensajeria" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D]">Mensajería</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>

                {/* 3. Mis Pacientes */}
                <Link to="/pacientes" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group opacity-60 hover:opacity-100">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D]">Mis Pacientes</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>

                {/* 4. Mi Disponibilidad */}
                <Link to="/disponibilidad" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group opacity-60 hover:opacity-100">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D]">Mi Disponibilidad</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>

                {/* 5. Mi Perfil Público */}
                <Link to="/perfil-fisio" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-[#F8FAF9] transition group">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#0A1E3D]">Mi Perfil Público</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>

              </div>
            </div>

            {/* NOTAS O RECORDATORIOS */}
            <div className="bg-[#0A1E3D] rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle className="h-24 w-24" />
              </div>
              <h3 className="font-bold mb-2 relative z-10">¡Todo al día!</h3>
              <p className="text-sm text-slate-300 relative z-10 leading-relaxed">
                Recuerda que al completar una cita, podrás redactar sus notas clínicas directamente en la sección de Agenda.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
