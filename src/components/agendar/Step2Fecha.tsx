import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function Step2Fecha({ fisioId, data, onNext, onBack }: any) {
  const [fecha, setFecha] = useState(data.fecha || '');
  const [hora, setHora] = useState(data.hora || '');
  
  const [horariosDelDia, setHorariosDelDia] = useState<string[]>([]);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [loadingHoras, setLoadingHoras] = useState(false);

  // Fecha de hoy para que no puedan elegir días pasados
  const hoyStr = new Date().toISOString().split('T')[0];

  // Cuando se selecciona un día, consultar Disponibilidad y Citas Ocupadas
  useEffect(() => {
    if (!fecha) return;

    const fetchDisponibilidadYHoras = async () => {
      setLoadingHoras(true);

      // 1. Saber qué día de la semana es (0 = Dom, 1 = Lun, etc.)
      const [year, month, day] = fecha.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      const diaSemana = dateObj.getDay();

      // 2. Traer el horario del fisio para ese día
      const { data: disp } = await supabase
        .from('disponibilidad')
        .select('hora_inicio, hora_fin')
        .eq('fisioterapeuta_id', fisioId)
        .eq('dia_semana', diaSemana)
        .maybeSingle();

      if (!disp) {
        // El fisio no trabaja este día
        setHorariosDelDia([]);
        setHorasOcupadas([]);
        setLoadingHoras(false);
        setHora('');
        return;
      }

      // 3. 🚀 CORRECCIÓN: Generar los bloques de hora de manera segura
      const generados = [];
      // Extraemos solo la hora (ej: de "09:00:00" extrae "09" y lo convierte en el número 9)
      const horaInicioNum = parseInt(disp.hora_inicio.split(':')[0], 10);
      const horaFinNum = parseInt(disp.hora_fin.split(':')[0], 10);
      
      for (let h = horaInicioNum; h < horaFinNum; h++) {
        // Volvemos a formatear a texto con dos ceros (Ej: 9 -> "09:00")
        generados.push(`${h.toString().padStart(2, '0')}:00`);
      }
      
      setHorariosDelDia(generados);

      // 4. Traer las horas ya ocupadas (citas agendadas)
      const { data: citas } = await supabase
        .from('citas')
        .select('hora_cita')
        .eq('fisioterapeuta_id', fisioId)
        .eq('fecha_cita', fecha)
        .neq('estado', 'cancelada');

      if (citas) {
        // Extraemos solo los primeros 5 caracteres por si Supabase manda los segundos ("09:00:00" -> "09:00")
        const ocupadas = citas.map((c: any) => c.hora_cita.substring(0, 5));
        setHorasOcupadas(ocupadas);
      } else {
        setHorasOcupadas([]);
      }

      setLoadingHoras(false);
      setHora(''); // Resetear hora si cambia de día
    };

    fetchDisponibilidadYHoras();
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
            <>
              {horariosDelDia.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {horariosDelDia.map((bloque) => {
                    const ocupado = horasOcupadas.includes(bloque);
                    
                    // Lógica extra: Si el día elegido es hoy, bloquear horas que ya pasaron
                    const esHoy = fecha === hoyStr;
                    const horaActual = new Date().getHours();
                    const horaBloque = parseInt(bloque.split(':')[0], 10);
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
              ) : (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                  El fisioterapeuta no atiende en el día seleccionado. Por favor elige otra fecha.
                </div>
              )}
            </>
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
