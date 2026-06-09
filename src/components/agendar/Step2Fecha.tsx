import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function Step2Fecha({ fisioId, data, onNext, onBack }: any) {
  const [fecha, setFecha] = useState(data.fecha || '');
  const [hora, setHora] = useState(data.hora || '');
  
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [loadingHoras, setLoadingHoras] = useState(false);

  // Fecha de hoy para que no puedan elegir días pasados
  const hoyStr = new Date().toISOString().split('T')[0];
  
  // Amplié tu lista de horarios para que la cuadrícula se vea mejor (puedes ajustar los que quieras)
  const horariosDisponibles = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  // Cuando se selecciona un día, consultar Supabase
  useEffect(() => {
    if (!fecha) return;

    const fetchHorasOcupadas = async () => {
      setLoadingHoras(true);
      const { data: citas } = await supabase
        .from('citas')
        .select('hora_cita')
        .eq('fisioterapeuta_id', fisioId)
        .eq('fecha_cita', fecha)
        .neq('estado', 'cancelada');

      if (citas) {
        // Guardamos las horas que la BD nos dice que ya están tomadas
        // (Formato esperado de Supabase Time: "09:00:00")
        const ocupadas = citas.map((c: any) => c.hora_cita.substring(0, 5));
        setHorasOcupadas(ocupadas);
      }
      setLoadingHoras(false);
      setHora(''); // Resetear hora si cambia de día
    };

    fetchHorasOcupadas();
  }, [fecha, fisioId]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-[#0A1E3D]">Selecciona fecha y hora</h2>
        <p className="text-slate-500 text-sm mt-1">Horarios disponibles en tiempo real.</p>
      </div>

      <div className="space-y-6">
        {/* Selector de Fecha */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Fecha de la sesión</label>
          <input 
            type="date" 
            min={hoyStr}
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition text-slate-700 font-medium"
          />
        </div>

        {/* Selector de Horas */}
        <div className={`space-y-2 transition-opacity duration-300 ${!fecha ? 'opacity-30 pointer-events-none' : 'opacity-100 animate-fadeIn'}`}>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Horarios Disponibles</label>
          
          {loadingHoras ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1A5C3A]"></span> Verificando disponibilidad...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {horariosDisponibles.map((bloque) => {
                const ocupado = horasOcupadas.includes(bloque);
                
                // Lógica extra: Si el día elegido es hoy, bloquear horas que ya pasaron
                const esHoy = fecha === hoyStr;
                const horaActual = new Date().getHours();
                const horaBloque = parseInt(bloque.split(':')[0]);
                const yaPaso = esHoy && horaActual >= horaBloque;

                // Está inhabilitado si está ocupado en la BD o si la hora ya pasó hoy
                const inhabilitado = ocupado || yaPaso;

                return (
                  <button
                    key={bloque}
                    disabled={inhabilitado}
                    onClick={() => setHora(bloque)}
                    className={`py-3 rounded-xl text-sm font-bold border transition flex items-center justify-center gap-1.5 ${
                      inhabilitado 
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through' 
                        : hora === bloque 
                          ? 'bg-[#1A5C3A] text-white border-[#1A5C3A] shadow-md shadow-[#1A5C3A]/20' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#1A5C3A] hover:text-[#1A5C3A]'
                    }`}
                  >
                    {bloque}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Botones de Navegación */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
        <button onClick={onBack} className="font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        
        <button 
          onClick={() => onNext({ fecha, hora })}
          disabled={!fecha || !hora}
          className="bg-[#0A1E3D] hover:bg-[#122d5a] text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
