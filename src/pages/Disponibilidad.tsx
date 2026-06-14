import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Disponibilidad() {
  const [horarios, setHorarios] = useState<any[]>(Array(7).fill({ inicio: '09:00', fin: '18:00' }));

  const guardar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // Borrar actuales y guardar nuevos en bucle simple
    await supabase.from('disponibilidad').delete().eq('fisioterapeuta_id', user?.id);
    const inserts = horarios.map((h, i) => ({ fisioterapeuta_id: user?.id, dia_semana: i, hora_inicio: h.inicio, hora_fin: h.fin }));
    await supabase.from('disponibilidad').insert(inserts);
    alert('Guardado');
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-sm">
      <h2 className="font-bold text-lg mb-4">Mi Horario Laboral</h2>
      {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((dia, i) => (
        <div key={dia} className="flex gap-2 mb-2 items-center">
          <span className="w-12 text-sm font-bold">{dia}</span>
          <input type="time" value={horarios[i].inicio} onChange={(e) => {
            const nuevo = [...horarios]; nuevo[i].inicio = e.target.value; setHorarios(nuevo);
          }} className="border p-1 rounded"/>
          <span>a</span>
          <input type="time" value={horarios[i].fin} onChange={(e) => {
            const nuevo = [...horarios]; nuevo[i].fin = e.target.value; setHorarios(nuevo);
          }} className="border p-1 rounded"/>
        </div>
      ))}
      <button onClick={guardar} className="mt-4 w-full bg-[#1A5C3A] text-white py-2 rounded-xl font-bold">Guardar</button>
    </div>
  );
}
