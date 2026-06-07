import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, FileText, CheckCircle, TrendingUp, MessageSquare, Search, BookOpen, Heart, AlertCircle } from 'lucide-react';

export default function DashboardPaciente() {
  const [citas, setCitas] = useState<any[]>([]);
  const [nombrePaciente, setNombrePaciente] = useState('Usuario');
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      fetchPerfil(user.id);
      fetchCitas(user.id);
    }
    loadData();
  }, []);

  async function fetchPerfil(userId: string) {
    const { data } = await supabase.from('pacientes').select('nombre_completo').eq('id', userId).single();
    if (data) setNombrePaciente(data.nombre_completo.split(' ')[0]);
  }

  async function fetchCitas(userId: string) {
    const { data, error } = await supabase
      .from('citas')
      .select('*, fisioterapeutas(nombres, apellidos)')
      .eq('paciente_id', userId)
      .order('fecha_cita', { ascending: true });
    if (!error) setCitas(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] sm:min-h-screen bg-[#F8FAFC] p-4 sm:p-8 pb-20 sm:pb-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1E3D]">Hola, {nombrePaciente} 👋</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Aquí está el resumen de tu recuperación</p>
        </header>

        {/* Recordatorio */}
        <div className="bg-orange-50 border border-orange-100 p-4 sm:p-5 rounded-[1.5rem] flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl shrink-0">
              <AlertCircle className="h-5 w-5 text-orange-600"/>
            </div>
            <p className="text-orange-900 font-medium text-sm">Recordatorio: tienes una sesión en las próximas 24 horas</p>
          </div>
          <button className="w-full sm:w-auto bg-white px-5 py-2.5 rounded-xl text-sm font-bold border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors shadow-sm">
            Ver cita
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={<Calendar className="h-5 w-5"/>} label="Próximas" value={citas.filter(c => c.estado === 'programada').length.toString()} />
          <StatCard icon={<CheckCircle className="h-5 w-5"/>} label="Completadas" value={citas.filter(c => c.estado === 'completada').length.toString()} />
          <StatCard icon={<FileText className="h-5 w-5"/>} label="Notas" value="0" />
          <StatCard icon={<TrendingUp className="h-5 w-5"/>} label="Progreso" value="50%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Menú Principal */}
            <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-5 sm:mb-6 text-[#0A1E3D]">Menú principal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <MenuCard icon={<Search className="h-5 w-5 text-blue-600"/>} title="Buscar fisioterapeuta" subtitle="Agenda una nueva sesión" />
                <MenuCard icon={<Calendar className="h-5 w-5 text-green-600"/>} title="Mis citas" subtitle="2 próximas programadas" />
                <MenuCard icon={<FileText className="h-5 w-5 text-purple-600"/>} title="Notas clínicas" subtitle="Recomendaciones de tu fisio" />
                <MenuCard icon={<BookOpen className="h-5 w-5 text-orange-600"/>} title="Ejercicios en casa" subtitle="Rutinas asignadas" />
                <MenuCard icon={<MessageSquare className="h-5 w-5 text-sky-600"/>} title="Mensajes" subtitle="Conversa con tu profesional" />
                <MenuCard icon={<Heart className="h-5 w-5 text-rose-600"/>} title="Mi salud" subtitle="Historial y registros" />
              </div>
            </div>

            {/* Historial de Citas */}
            <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-4 sm:mb-6 text-[#0A1E3D]">Historial de citas</h2>
              {citas.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aún no tienes citas registradas.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {citas.map(cita => (
                    <div key={cita.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-[#0A1E3D]">{cita.fisioterapeutas?.nombres || 'Profesional'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{cita.fecha_cita} • {cita.hora_cita}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider
                        ${cita.estado === 'programada' ? 'bg-sky-50 text-sky-600' : 
                          cita.estado === 'completada' ? 'bg-green-50 text-green-600' : 
                          'bg-slate-50 text-slate-600'}`}>
                        {cita.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-[#0A1E3D] p-6 rounded-[1.5rem] shadow-md text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
              <div className="relative z-10">
                <h3 className="font-bold mb-2 text-lg">Tu recuperación</h3>
                <p className="text-sm text-blue-200 mb-6 leading-relaxed">Llevas {citas.filter(c => c.estado === 'completada').length} sesiones completadas. ¡Sigue así!</p>
                <div className="h-2.5 bg-blue-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-[#0A1E3D]"><MessageSquare className="h-4 w-4 text-slate-400" /> Mensajes recientes</h3>
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">No hay mensajes nuevos.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-slate-400 mb-3 bg-slate-50 w-max p-2.5 rounded-xl">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-[#0A1E3D] tracking-tight">{value}</div>
      <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function MenuCard({ icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <button className="flex items-center p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 group text-left shadow-sm hover:shadow">
      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mr-3 sm:mr-4 group-hover:bg-white transition-colors">{icon}</div>
      <div>
        <p className="font-bold text-sm text-[#0A1E3D] mb-0.5">{title}</p>
        <p className="text-[11px] text-slate-500 leading-tight">{subtitle}</p>
      </div>
    </button>
  );
}
