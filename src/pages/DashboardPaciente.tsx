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
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-[#0A1E3D]">Hola, {nombrePaciente} 👋</h1>
          <p className="text-slate-500">Aquí está el resumen de tu recuperación</p>
        </header>

        {/* Recordatorio */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full"><AlertCircle className="h-5 w-5 text-orange-600"/></div>
            <p className="text-orange-900 font-medium text-sm">Recordatorio: tienes una sesión en las próximas 24 horas</p>
          </div>
          <button className="bg-white px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50">Ver cita</button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Calendar className="h-5 w-5"/>} label="Próximas" value={citas.filter(c => c.estado === 'programada').length.toString()} />
          <StatCard icon={<CheckCircle className="h-5 w-5"/>} label="Completadas" value={citas.filter(c => c.estado === 'completada').length.toString()} />
          <StatCard icon={<FileText className="h-5 w-5"/>} label="Notas" value="0" />
          <StatCard icon={<TrendingUp className="h-5 w-5"/>} label="Progreso" value="50%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Menú Principal */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-6">Menú principal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MenuCard icon={<Search className="h-5 w-5 text-blue-600"/>} title="Buscar fisioterapeuta" subtitle="Agenda una nueva sesión" />
                <MenuCard icon={<Calendar className="h-5 w-5 text-green-600"/>} title="Mis citas" subtitle="2 próximas programadas" />
                <MenuCard icon={<FileText className="h-5 w-5 text-blue-600"/>} title="Notas clínicas" subtitle="Recomendaciones de tu fisio" />
                <MenuCard icon={<BookOpen className="h-5 w-5 text-green-600"/>} title="Ejercicios en casa" subtitle="Rutinas asignadas" />
                <MenuCard icon={<MessageSquare className="h-5 w-5 text-blue-600"/>} title="Mensajes" subtitle="Conversa con tu profesional" />
                <MenuCard icon={<Heart className="h-5 w-5 text-green-600"/>} title="Mi salud" subtitle="Historial y registros" />
              </div>
            </div>

            {/* Historial de Citas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-6">Historial de citas</h2>
              <div className="space-y-4">
                {citas.map(cita => (
                  <div key={cita.id} className="flex justify-between items-center p-4 border-b last:border-0 border-slate-50">
                    <div>
                      <p className="font-bold text-sm">{cita.fisioterapeutas?.nombres || 'Profesional'}</p>
                      <p className="text-xs text-slate-500">{cita.fecha_cita} • {cita.hora_cita}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase">{cita.estado}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-8">
            <div className="bg-[#0A1E3D] p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold mb-2">Tu recuperación</h3>
              <p className="text-sm text-blue-200 mb-4">Llevas 3 sesiones completadas este mes. ¡Sigue así!</p>
              <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: '50%' }}></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4" /> Mensajes recientes</h3>
              <p className="text-sm text-slate-400">No hay mensajes nuevos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="text-slate-400 mb-2">{icon}</div>
      <div className="text-xl font-bold text-[#0A1E3D]">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function MenuCard({ icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <button className="flex items-center p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group text-left">
      <div className="bg-slate-50 p-3 rounded-lg mr-4 group-hover:bg-white">{icon}</div>
      <div>
        <p className="font-bold text-sm text-[#0A1E3D]">{title}</p>
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}