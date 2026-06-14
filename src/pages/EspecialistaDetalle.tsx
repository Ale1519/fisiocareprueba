import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  User,
  CheckCircle,
  Star,
  Shield,
  Briefcase,
  Home as HomeIcon,
  Video,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function EspecialistaDetalle() {
  const { id } = useParams<{ id: string }>(); // Captura el ID de la URL
  const navigate = useNavigate(); // 🚀 Para poder navegar al chat
  const [fisio, setFisio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFisio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('fisioterapeutas')
        .select(`
          *,
          fisioterapeuta_especialidades ( especialidades ( nombre ) ),
          fisioterapeuta_distritos ( distritos ( nombre ) )
        `)
        .eq('id', id)
        .single();

      if (data) {
        setFisio({
          ...data,
          nombre_completo: `${data.nombres} ${data.apellidos}`,
          especialidades: data.fisioterapeuta_especialidades?.map((fe: any) => fe.especialidades?.nombre) || [],
          distritos: data.fisioterapeuta_distritos?.map((fd: any) => fd.distritos?.nombre) || [],
          rating: 5.0, // Mock temporal
          resenas: Math.floor(Math.random() * 50) + 10 // Mock temporal
        });
      } else if (error) {
        console.error("Error al cargar detalle:", error);
      }
      setLoading(false);
    };

    if (id) fetchFisio();
  }, [id]);

  // 🚀 LÓGICA PARA EL BOTÓN DE MENSAJE
  const handleMensaje = async () => {
    if (!fisio) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    } else {
      // Navegamos a mensajería y pasamos los datos del fisio en el "state" de la ruta
      navigate('/mensajeria', { 
        state: { 
          nuevoContacto: {
            id: fisio.id,
            nombre: fisio.nombre_completo
          }
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A5C3A]"></div>
      </div>
    );
  }

  if (!fisio) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#0A1E3D] mb-2">Especialista no encontrado</h2>
        <p className="text-slate-500 mb-6">El fisioterapeuta que buscas no existe o ha sido eliminado.</p>
        <Link to="/especialistas" className="bg-[#1A5C3A] text-white px-6 py-3 rounded-xl font-bold">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-body">
      {/* Botón Volver */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-4">
        <Link to="/especialistas" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] transition font-medium text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver a resultados
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Info Principal */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header del Perfil */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start shadow-sm">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 shrink-0">
              <User className="h-12 w-12 sm:h-16 sm:w-16 stroke-[1.2]" />
            </div>
            
            <div className="space-y-3 w-full">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1E3D] font-display">
                  {fisio.nombre_completo}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#1A6645] font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-[#B8E0CA]/60 tracking-wide uppercase">
                    <CheckCircle className="h-3 w-3 fill-current" /> Perfil Verificado
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-700">{fisio.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-light underline decoration-slate-300 underline-offset-2 cursor-pointer">
                      ({fisio.resenas} reseñas)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {fisio.especialidades.map((esp: string, i: number) => (
                  <span key={i} className="bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-100">
                    {esp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sección Sobre Mí */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#0A1E3D] border-b border-slate-100 pb-3">Sobre mí</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {fisio.bio || "Este profesional aún no ha escrito su biografía."}
            </p>
          </div>

          {/* Formación y Credenciales */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#0A1E3D] border-b border-slate-100 pb-3">Formación y Credenciales</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-[#1A5C3A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Colegiatura</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">CFF {fisio.colegiatura || 'En proceso'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-[#1A5C3A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experiencia</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{fisio.anos_experiencia || 0} años de servicio</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Tarjeta de Reserva (Sticky) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <div className="bg-white border border-[#1A5C3A]/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            {/* Precio */}
            <div className="text-center pb-6 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-500 mb-1">Precio por sesión</p>
              <h2 className="text-4xl font-extrabold text-[#0A1E3D]">S/ {fisio.precio_sesion}</h2>
            </div>

            {/* Modalidades */}
            <div className="py-6 space-y-4 border-b border-slate-100">
              {fisio.ofrece_domicilio && (
                <div className="flex gap-3">
                  <HomeIcon className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Atención a domicilio</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Atiende en: {fisio.distritos.length > 0 ? fisio.distritos.join(', ') : 'Zonas no especificadas'}
                    </p>
                  </div>
                </div>
              )}

              {fisio.ofrece_videollamada && (
                <div className="flex gap-3">
                  <Video className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Videollamada</p>
                    <p className="text-xs text-slate-500 mt-1">Para consultas y seguimiento</p>
                  </div>
                </div>
              )}
            </div>
            
           {/* Botones de Acción */}
            <div className="pt-6 space-y-3">
              <Link 
                to={`/agendar/${fisio.id}`} 
                className="w-full bg-[#1A5C3A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#124229] transition shadow-sm"
              >
                <Calendar className="h-5 w-5" /> Agendar Cita
              </Link>
              
              {/* 🚀 BOTÓN MODIFICADO PARA ENVIAR MENSAJE */}
              <button 
                onClick={handleMensaje}
                className="w-full bg-slate-50 text-slate-700 border border-slate-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition"
              >
                <MessageSquare className="h-5 w-5" /> Enviar Mensaje
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 mt-4">
              Al agendar, confirmas que has leído nuestros términos de servicio.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
