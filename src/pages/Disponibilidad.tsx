import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock } from 'lucide-react';

export default function Disponibilidad() {
  const navigate = useNavigate();
  const [fisioId, setFisioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const [horarios, setHorarios] = useState(
    diasNombres.map((_, index) => ({
      dia_semana: index,
      activo: false,
      hora_inicio: '09:00',
      hora_fin: '18:00'
    }))
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');
    setFisioId(user.id);

    const { data } = await supabase
      .from('disponibilidad')
      .select('*')
      .eq('fisioterapeuta_id', user.id);

    if (data && data.length > 0) {
      const nuevosHorarios = [...horarios];
      data.forEach(d => {
        nuevosHorarios[d.dia_semana] = {
          dia_semana: d.dia_semana,
          activo: true,
          hora_inicio: d.hora_inicio.substring(0, 5), // Cortar "09:00:00" a "09:00"
          hora_fin: d.hora_fin.substring(0, 5)
        };
      });
      setHorarios(nuevosHorarios);
    }
    setLoading(false);
  };

  const guardar = async () => {
    if (!fisioId) return;
    setGuardando(true);

    // 1. Borrar lo anterior
    await supabase.from('disponibilidad').delete().eq('fisioterapeuta_id', fisioId);

    // 2. Insertar solo los días marcados como activos
    const inserts = horarios
      .filter(h => h.activo)
      .map(h => ({
        fisioterapeuta_id: fisioId,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin
      }));

    if (inserts.length > 0) {
      await supabase.from('disponibilidad').insert(inserts);
    }

    alert('¡Horarios guardados correctamente!');
    setGuardando(false);
  };

  const actualizarHorario = (index: number, campo: string, valor: any) => {
    const nuevos = [...horarios];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setHorarios(nuevos);
  };

  if (loading) return <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A5C3A]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard-fisio" className="flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] font-bold text-sm mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Link>
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-[#0A1E3D] mb-2 flex items-center gap-2">
            <Clock className="h-6 w-6 text-[#1A5C3A]" /> Mi Disponibilidad
          </h2>
          <p className="text-slate-500 text-sm mb-8">Marca los días que trabajas y define tu horario de atención.</p>
          
          <div className="space-y-4">
            {horarios.map((h, i) => (
              <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition ${h.activo ? 'border-[#1A5C3A] bg-[#E8F5EE]' : 'border-slate-200 bg-slate-50'}`}>
                
                <label className="flex items-center gap-3 w-32 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={h.activo}
                    onChange={(e) => actualizarHorario(i, 'activo', e.target.checked)}
                    className="h-5 w-5 accent-[#1A5C3A] cursor-pointer"
                  />
                  <span className={`font-bold ${h.activo ? 'text-[#0A1E3D]' : 'text-slate-400'}`}>{diasNombres[i]}</span>
                </label>

                {h.activo ? (
                  <div className="flex items-center gap-3">
                    <input 
                      type="time" 
                      value={h.hora_inicio} 
                      onChange={(e) => actualizarHorario(i, 'hora_inicio', e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-[#1A5C3A]"
                    />
                    <span className="text-slate-400 text-sm">a</span>
                    <input 
                      type="time" 
                      value={h.hora_fin} 
                      onChange={(e) => actualizarHorario(i, 'hora_fin', e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-[#1A5C3A]"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">No disponible</span>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={guardar} 
            disabled={guardando}
            className="mt-8 w-full bg-[#0A1E3D] hover:bg-[#122d5a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {guardando ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="h-5 w-5" /> Guardar Horarios</>}
          </button>
        </div>
      </div>
    </div>
  );
}
