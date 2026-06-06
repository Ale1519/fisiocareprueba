import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Definimos la interfaz para el estado de la lista
interface Especialidad {
  id: string;
  nombre: string;
}

export default function Step2Profesional({ onNext, onBack }: any) {
  const [especialidadesLista, setEspecialidadesLista] = useState<Especialidad[]>([]);
  const [data, setData] = useState({ 
    colegiatura: '', 
    anos_experiencia: '', 
    especialidades: [] as string[], // Ahora guardamos los UUIDs como strings
    bio: '' 
  });

  // Cargar especialidades desde la base de datos
  useEffect(() => {
    async function fetchEspecialidades() {
      const { data: espData, error } = await supabase.from('especialidades').select('id, nombre');
      if (!error && espData) {
        setEspecialidadesLista(espData);
      }
    }
    fetchEspecialidades();
  }, []);

  // Función corregida para manejar IDs (UUIDs)
  const toggleEspecialidad = (idSeleccionado: string) => {
    setData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(idSeleccionado)
        ? prev.especialidades.filter(id => id !== idSeleccionado)
        : [...prev.especialidades, idSeleccionado]
    }));
  };

  const validate = () => {
    if (!/^[A-Z0-9-]+$/i.test(data.colegiatura)) return alert("Colegiatura inválida");
    if (!/^\d+$/.test(data.anos_experiencia)) return alert("Años de experiencia debe ser número");
    if (data.especialidades.length === 0) return alert("Selecciona al menos una especialidad");
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#0A1E3D]">Información profesional</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">N° de colegiatura (CFTP)</label>
          <input 
            placeholder="CFTP-12345" 
            className="w-full p-3 border rounded-xl" 
            value={data.colegiatura}
            onChange={e => setData({...data, colegiatura: e.target.value})} 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">Años de experiencia</label>
          <input 
            type="number" 
            placeholder="5" 
            className="w-full p-3 border rounded-xl" 
            value={data.anos_experiencia}
            onChange={e => setData({...data, anos_experiencia: e.target.value})} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500">Especialidades</label>
        <div className="grid grid-cols-2 gap-2">
          {especialidadesLista.map((esp) => (
            <button
              key={esp.id}
              type="button"
              onClick={() => toggleEspecialidad(esp.id)}
              className={`p-3 text-sm border rounded-xl transition-all ${
                data.especialidades.includes(esp.id) 
                ? 'border-[#1A5C3A] bg-[#f0f9f4] text-[#1A5C3A] font-semibold' 
                : 'border-slate-200 text-slate-600'
              }`}
            >
              {esp.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500">Sobre ti</label>
        <textarea 
          placeholder="Cuéntales a tus pacientes sobre tu enfoque..." 
          className="w-full p-3 border rounded-xl h-24" 
          value={data.bio}
          onChange={e => setData({...data, bio: e.target.value})} 
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="flex-1 p-4 border rounded-xl font-bold flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button onClick={validate} className="flex-1 bg-[#1A5C3A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
          Continuar <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}