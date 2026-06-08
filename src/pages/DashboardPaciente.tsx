import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, MapPin, Video, User, Plus, FileText, ChevronRight } from 'lucide-react';

export default function DashboardPaciente() {
  const [paciente, setPaciente] = useState<any>(null);
  const [proximaCita, setProximaCita] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Traer datos del paciente
        const { data: dataPaciente } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setPaciente(dataPaciente || { nombre_completo: user.email?.split('@')[0] });

        // 2. Traer citas del paciente (uniendo con los datos del fisioterapeuta)
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
          // Separar la próxima cita (programada) del resto del historial
          const citasProgramadas = citas.filter(c => c.estado === 'programada');
          const citasPasadas = citas.filter(c => c.estado !== 'programada');

          setProximaCita(citasProgramadas.length > 0 ? citasProgramadas[0] : null);
          setHistorial(citasPasadas);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDashboard();
  }, []);

  // Función auxiliar para formatear la fecha
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(Number(year), Number(month) - 1, Number(day));
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A5C3A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-12">
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
            
            {/* SECCIÓN: PRÓXIMA CITA */}
            <section>
              <h2 className="text-lg font-bold text-[#0A1E3D] mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1A5C3A]" /> Tu próxima cita
              </h2>
              
              {proximaCita ? (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1A6645] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                      {proximaCita.modalidad === 'domicilio' ? <MapPin className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                      {proximaCita.modalidad === 'domicilio' ? 'A Domicilio' : 'Videollamada'}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#0A1E3D] capitalize">
                        {formatearFecha(proximaCita.fecha_cita)}
                      </h3>
                      <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" /> {proximaCita.hora_cita} hrs (50 min)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Especialista</p>
                        <p className="text-sm font-bold text-[#0A1E3D]">
                          {proximaCita.fisioterapeutas?.nombres} {proximaCita.fisioterapeutas?.apellidos}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[160px]">
                    {proximaCita.modalidad === 'videollamada' ? (
                      <button className="w-full bg-[#1A5C3A] hover:bg-[#124229] text-white px-5 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2">
                        <Video className="h-4 w-4" /> Entrar a sala
                      </button>
                    ) : (
                      <div className="w-full bg-slate-50 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm text-center border border-slate-200">
                        Confirmada
                      </div>
                    )}
                    <button className="w-full text-slate-400 hover:text-slate-600 font-semibold text-xs transition">
                      Reprogramar o cancelar
                    </button>
                  </div>
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
                  <Link to="/especialistas" className="mt-2 bg-[#2B4B6F] hover:bg-[#1E3A5F] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">
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
    </div>
  );
}
