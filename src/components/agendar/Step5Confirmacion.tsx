import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Home } from 'lucide-react';

export default function Step5Confirmacion({ fisio, data }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   const crearCitaEnBaseDeDatos = async () => {
      try {
        // 1. Obtener el usuario actual de Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No se encontró sesión de usuario");

        // 2. VERIFICACIÓN: Comprobar si ya existe en la tabla 'pacientes'
        const { data: pacienteExistente, error: errorBusqueda } = await supabase
          .from('pacientes')
          .select('id')
          .eq('id', user.id)
          .maybeSingle(); // maybeSingle devuelve null si no hay filas (en lugar de dar error)

        // 3. CREACIÓN AUTOMÁTICA: Si no existe, lo insertamos para cumplir la llave foránea
        if (!pacienteExistente) {
          const { error: insertPacienteError } = await supabase
            .from('pacientes')
            .insert([{
              id: user.id,
              // Usamos datos genéricos o del email por ahora para que no falle si tienes campos NOT NULL
              nombres: user.email?.split('@')[0] || 'Paciente',
              apellidos: 'Nuevo',
              telefono: '000000000' 
            }]);
            
          if (insertPacienteError) throw new Error("No se pudo crear el perfil base del paciente: " + insertPacienteError.message);
        }

        // 4. Insertar la cita (ahora 100% seguros de que la llave foránea hará match)
        const { error: insertCitaError } = await supabase
          .from('citas')
          .insert([{
            paciente_id: user.id,
            fisioterapeuta_id: fisio.id,
            fecha_cita: data.fecha,
            hora_cita: data.hora,
            modalidad: data.modalidad,
            distrito_id: data.distrito_id || null,
            direccion_exacta: data.direccion_exacta || null,
            precio: fisio.precio_sesion,
            estado: 'programada'
          }]);

        if (insertCitaError) throw insertCitaError;

      } catch (err: any) {
        console.error("Error en el flujo de guardado:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    crearCitaEnBaseDeDatos();
  }, [fisio, data]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A5C3A] mx-auto"></div>
        <p className="text-slate-500 animate-pulse font-medium">Procesando tu reserva...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl inline-block">
          <p className="font-bold">Hubo un problema al procesar tu cita</p>
          <p className="text-xs opacity-80">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="block mx-auto text-[#1A5C3A] font-bold underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 text-center space-y-8 animate-fadeIn">
      {/* Icono de Éxito */}
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-[#E8F5EE] rounded-full scale-150 blur-xl opacity-50"></div>
        <CheckCircle2 className="h-20 w-20 text-[#1A5C3A] relative z-10" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-[#0A1E3D]">¡Sesión confirmada!</h2>
        <p className="text-slate-500 font-medium">Te enviamos los detalles a tu correo</p>
      </div>

      {/* Resumen Final Estilo Prototipo */}
      <div className="max-w-xs mx-auto bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 text-left">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Profesional</span>
          <span className="text-[#0A1E3D] font-bold">{fisio.nombres} {fisio.apellidos}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Fecha</span>
          <span className="text-[#0A1E3D] font-bold">{data.fecha}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Hora</span>
          <span className="text-[#0A1E3D] font-bold">{data.hora}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-medium">Modalidad</span>
          <span className="text-[#0A1E3D] font-bold capitalize">{data.modalidad}</span>
        </div>
      </div>

      {/* Botones Finales */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button 
          onClick={() => navigate('/especialistas')}
          className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
        >
          Buscar más
        </button>
        <button 
          onClick={() => navigate('/dashboard-paciente')}
          className="w-full py-3.5 rounded-xl bg-[#0A1E3D] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#122d5a] transition"
        >
          <Home className="h-4 w-4" /> Ir a mi panel
        </button>
      </div>
    </div>
  );
}
