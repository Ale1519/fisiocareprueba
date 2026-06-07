import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, Clock, Home as HomeIcon, Video, MapPin } from 'lucide-react';

export default function Step3Resumen({ fisio, data, onNext, onBack }: any) {
  const [nombreDistrito, setNombreDistrito] = useState('');
  const isDomicilio = data.modalidad === 'domicilio';

  // Obtener el nombre del distrito basado en el ID seleccionado previamente
  useEffect(() => {
    if (isDomicilio && data.distrito_id) {
      const fetchNombreDistrito = async () => {
        const { data: dData } = await supabase
          .from('distritos')
          .select('nombre')
          .eq('id', data.distrito_id)
          .single();
        if (dData) setNombreDistrito(dData.nombre);
      };
      fetchNombreDistrito();
    }
  }, [isDomicilio, data.distrito_id]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0A1E3D]">Resumen de tu cita</h2>
        <p className="text-slate-500 text-sm mt-1">Confirma que toda la información sea correcta antes de proceder al pago.</p>
      </div>

      {/* BLOQUE DE REVISIÓN CENTRAL */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
        
        {/* Detalle de Modalidad */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200/60">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1A5C3A] shrink-0">
            {isDomicilio ? <HomeIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modalidad elegida</p>
            <p className="text-sm font-semibold text-[#0A1E3D]">
              {isDomicilio ? 'Atención Física a Domicilio' : 'Consulta Virtual / Videollamada'}
            </p>
          </div>
        </div>

        {/* Detalle de Fecha y Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha programada</p>
              <p className="text-sm font-semibold text-[#0A1E3D]">{data.fecha}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bloque horario</p>
              <p className="text-sm font-semibold text-[#0A1E3D]">{data.hora} hrs</p>
            </div>
          </div>
        </div>

        {/* Detalle de Ubicación (Solo si corresponde) */}
        {isDomicilio && (
          <div className="flex items-start gap-3 pb-4 border-b border-slate-200/60 animate-fadeIn">
            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dirección de Destino</p>
              <p className="text-sm font-semibold text-[#0A1E3D]">
                {data.direccion_exacta}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Distrito: {nombreDistrito || 'Cargando...'}</p>
            </div>
          </div>
        )}

        {/* Desglose de Precios */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inversión del servicio</p>
            <p className="text-xs text-slate-500 font-light mt-0.5">Tarifa estándar por sesión</p>
          </div>
          <p className="text-3xl font-extrabold text-[#1A5C3A]">S/ {fisio?.precio_sesion}</p>
        </div>
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
        <button onClick={onBack} className="font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        
        <button 
          onClick={() => onNext({})} // No hay nuevos datos que mutar, el estado está completo
          className="bg-[#6B8A9E] hover:bg-[#5a7689] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
        >
          Proceder al Pago →
        </button>
      </div>
    </div>
  );
}
