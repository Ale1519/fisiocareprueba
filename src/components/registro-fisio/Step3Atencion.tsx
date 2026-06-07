import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Step3Atencion({ onNext, onBack }: any) {
  const [distritos, setDistritos] = useState<{ id: number; nombre: string }[]>([]);
  const [data, setData] = useState({
    ofrece_domicilio: false,
    ofrece_videollamada: false,
    distritos_seleccionados: [] as any[],
    precio_sesion: ''
  });

  useEffect(() => {
    async function fetchDistritos() {
      const { data: dData } = await supabase.from('distritos').select('*');
      if (dData) setDistritos(dData);
    }
    fetchDistritos();
  }, []);

  const toggleDistrito = (id: any) => {
    setData(prev => ({
      ...prev,
      distritos_seleccionados: prev.distritos_seleccionados.includes(id)
        ? prev.distritos_seleccionados.filter(d => d !== id)
        : [...prev.distritos_seleccionados, id]
    }));
  };

  const validate = () => {
    if (!data.ofrece_domicilio && !data.ofrece_videollamada) {
      return alert("Selecciona al menos una modalidad de atención (Domicilio o Videollamada).");
    }
    if (data.ofrece_domicilio && data.distritos_seleccionados.length === 0) {
      return alert("Si ofreces atención a domicilio, debes seleccionar al menos un distrito.");
    }
    if (!data.precio_sesion || Number(data.precio_sesion) <= 0) {
      return alert("Por favor, ingresa un precio válido por sesión.");
    }
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl sm:text-2xl font-bold text-[#0A1E3D]">Modalidad y zonas</h3>
      
      {/* Modalidades (1 columna móvil, 2 en PC) */}
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-500">Modalidades que ofreces</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button 
            onClick={() => setData({...data, ofrece_domicilio: !data.ofrece_domicilio})}
            className={`p-3.5 sm:p-4 text-sm sm:text-base border rounded-xl flex items-center gap-3 transition-colors ${data.ofrece_domicilio ? 'border-[#1A5C3A] bg-[#f0f9f4] text-[#1A5C3A] font-medium' : 'border-slate-200 text-slate-600 hover:border-[#1A5C3A]'}`}>
            <input type="checkbox" checked={data.ofrece_domicilio} readOnly className="accent-[#1A5C3A] w-4 h-4 shrink-0" /> A domicilio
          </button>
          <button 
            onClick={() => setData({...data, ofrece_videollamada: !data.ofrece_videollamada})}
            className={`p-3.5 sm:p-4 text-sm sm:text-base border rounded-xl flex items-center gap-3 transition-colors ${data.ofrece_videollamada ? 'border-[#1A5C3A] bg-[#f0f9f4] text-[#1A5C3A] font-medium' : 'border-slate-200 text-slate-600 hover:border-[#1A5C3A]'}`}>
            <input type="checkbox" checked={data.ofrece_videollamada} readOnly className="accent-[#1A5C3A] w-4 h-4 shrink-0" /> Videollamada
          </button>
        </div>
      </div>

      {/* Distritos (2 columnas en móvil, 3 en PC) */}
      <div className={`space-y-2.5 transition-opacity duration-300 ${!data.ofrece_domicilio ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <label className="text-xs sm:text-sm font-semibold text-slate-500">Distritos de Lima donde atiendes</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {distritos.map(d => (
            <button
              key={d.id}
              onClick={() => toggleDistrito(d.id)}
              className={`p-2.5 sm:p-3 text-[11px] sm:text-sm border rounded-xl transition-all text-center leading-tight ${data.distritos_seleccionados.includes(d.id) ? 'border-[#1A5C3A] bg-[#f0f9f4] text-[#1A5C3A] font-semibold shadow-sm' : 'border-slate-200 text-slate-600 hover:border-[#1A5C3A]'}`}
            >
              {d.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Precio */}
      <div className="space-y-1">
        <label className="text-xs sm:text-sm font-semibold text-slate-500">Precio por sesión (S/)</label>
        <input 
          type="number" 
          placeholder="Ej. 80"
          className="w-full p-3.5 sm:p-4 text-sm sm:text-base border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A5C3A] transition" 
          value={data.precio_sesion}
          onChange={e => setData({...data, precio_sesion: e.target.value})} 
        />
      </div>

      {/* Botones */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
        <button 
          onClick={onBack} 
          className="w-full sm:w-1/3 p-3.5 sm:p-4 border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button 
          onClick={validate} 
          className="w-full sm:w-2/3 bg-[#1A5C3A] text-white py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#124229] transition shadow-sm"
        >
          Continuar <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
