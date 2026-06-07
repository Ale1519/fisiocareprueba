import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Clock } from 'lucide-react';

export default function Step2Fecha({ fisioId, data, onNext, onBack }: any) {
  const [fecha, setFecha] = useState(data.fecha || '');
  const [hora, setHora] = useState(data.hora || '');
  
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [loadingHoras, setLoadingHoras] = useState(false);

  // Generamos los próximos 14 días a partir de hoy
  const generarDias = () => {
    const dias = [];
    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const fechaObj = new Date(hoy);
      fechaObj.setDate(hoy.getDate() + i);
      // Evitamos domingos (0)
      if (fechaObj.getDay() !== 0) {
        dias.push({
          fechaCompleta: fechaObj.toISOString().split('T')[0],
          nombreDia: fechaObj.toLocaleDateString('es-ES', { weekday: 'short' }),
          numeroDia: fechaObj.getDate()
        });
      }
    }
    return dias;
  };

  const diasDisponibles = generarDias();
  const bloquesHorarios = ['09:00', '11:00', '15:00', '17:00'];

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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0A1E3D]">Selecciona fecha y hora</h2>
        <p className="text-slate-500 text-sm mt-1">Horarios disponibles en tiempo real.</p>
      </div>

      {/* Slider de Fechas */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fechas disponibles</label>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {diasDisponibles.map((dia) => (
            <button
              key={dia.fechaCompleta}
              onClick={() => setFecha(dia.fechaCompleta)}
              className={`min-w-[72px] flex flex-col items-center p-3 rounded-2xl border-2 transition-all shrink-0 ${
                fecha === dia.fechaCompleta ? 'border-[#1A5C3A] bg-[#f0f9f4] text-[#1A5C3A]' : 'border-slate-200 text-slate-500 hover:border-[#1A5C3A]/50'
              }`}
            >
              <span className="text-xs uppercase font-medium">{dia.nombreDia}</span>
              <span className="text-xl font-bold mt-1">{dia.numeroDia}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Horas */}
      <div className={`space-y-3 transition-opacity ${!fecha ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horarios para el {fecha}</label>
        
        {loadingHoras ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1A5C3A]"></span> Verificando disponibilidad...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bloquesHorarios.map((bloque) => {
              const ocupado = horasOcupadas.includes(bloque);
              
              // Lógica extra: Si el día elegido es hoy, bloquear horas que ya pasaron
              const esHoy = fecha === new Date().toISOString().split('T')[0];
              const horaActual = new Date().getHours();
              const horaBloque = parseInt(bloque.split(':')[0]);
              const yaPaso = esHoy && horaActual >= horaBloque;

              const inhabilitado = ocupado || yaPaso;

              return (
                <button
                  key={bloque}
                  disabled={inhabilitado}
                  onClick={() => setHora(bloque)}
                  className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    inhabilitado ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through' :
                    hora === bloque ? 'border-[#1A5C3A] bg-[#1A5C3A] text-white font-bold' : 'border-slate-200 text-slate-600 hover:border-[#1A5C3A]/50'
                  }`}
                >
                  <Clock className="h-4 w-4" /> {bloque}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Botones de Navegación */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
        <button onClick={onBack} className="font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        
        <button 
          onClick={() => onNext({ fecha, hora })}
          disabled={!fecha || !hora}
          className="bg-[#6B8A9E] hover:bg-[#5a7689] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
