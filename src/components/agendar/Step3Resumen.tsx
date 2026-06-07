import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, Clock, Home as HomeIcon, Video, MapPin } from 'lucide-react';

export default function Step3Resumen({ fisio, data, onNext, onBack }: any) {
  // Estados para la dirección si es a domicilio
  const [distritos, setDistritos] = useState<any[]>([]);
  const [distritoId, setDistritoId] = useState(data.distrito_id || '');
  const [direccion, setDireccion] = useState(data.direccion_exacta || '');

  const isDomicilio = data.modalidad === 'domicilio';

  // Cargar distritos solo si la modalidad es a domicilio
  useEffect(() => {
    if (isDomicilio) {
      const fetchDistritos = async () => {
        const { data: dData } = await supabase.from('distritos').select('id, nombre');
        if (dData) setDistritos(dData);
      };
      fetchDistritos();
    }
  }, [isDomicilio]);

  // Validación: Si es domicilio, debe llenar los campos. Si es videollamada, siempre es válido.
  const isValido = isDomicilio ? (distritoId !== '' && direccion.trim() !== '') : true;

  const handleContinue = () => {
    onNext({
      distrito_id: isDomicilio ? distritoId : null,
      direccion_exacta: isDomicilio ? direccion : null
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0A1E3D]">Resumen de tu cita</h2>
        <p className="text-slate-500 text-sm mt-1">Verifica que los datos sean correctos antes de pagar.</p>
      </div>

      {/* TARJETA DE RESUMEN */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1A5C3A]">
            {isDomicilio ? <HomeIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Modalidad</p>
            <p className="text-sm font-semibold text-[#0A1E3D]">
              {isDomicilio ? 'Atención a domicilio' : 'Videollamada'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fecha</p>
              <p className="text-sm font-semibold text-[#0A1E3D]">{data.fecha}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hora</p>
              <p className="text-sm font-semibold text-[#0A1E3D]">{data.hora}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total a pagar</p>
          <p className="text-2xl font-extrabold text-[#1A5C3A]">S/ {fisio?.precio_sesion}</p>
        </div>
      </div>

      {/* FORMULARIO DE DIRECCIÓN (Solo aparece si es a domicilio) */}
      {isDomicilio && (
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-[#0A1E3D] text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#1A5C3A]" /> ¿A dónde irá el especialista?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Distrito</label>
              <select
                value={distritoId}
                onChange={(e) => setDistritoId(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:ring-1 focus:ring-[#1A5C3A] transition"
              >
                <option value="">Selecciona un distrito</option>
                {distritos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Dirección exacta</label>
              <input
                type="text"
                placeholder="Ej. Av. Larco 123, Dpto 401"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:ring-1 focus:ring-[#1A5C3A] transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
        <button onClick={onBack} className="font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        
        <button 
          onClick={handleContinue}
          disabled={!isValido}
          className="bg-[#6B8A9E] hover:bg-[#5a7689] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar al Pago →
        </button>
      </div>
    </div>
  );
}
