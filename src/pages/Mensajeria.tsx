import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, User, Search, Clock } from 'lucide-react';

export default function Mensajeria() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [rol, setRol] = useState<'paciente' | 'fisio' | null>(null);
  const [contactos, setContactos] = useState<any[]>([]);
  const [contactoActivo, setContactoActivo] = useState<any>(null);
  
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar usuario y determinar su rol
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUsuarioActual(user);

      // Verificar si es fisio
      const { data: fisio } = await supabase.from('fisioterapeutas').select('id').eq('id', user.id).maybeSingle();
      const userRol = fisio ? 'fisio' : 'paciente';
      setRol(userRol);

      cargarContactos(user.id, userRol);
    };
    initData();
  }, [navigate]);

  // Escuchar si venimos de la pantalla "Especialistas" con un contacto nuevo
  useEffect(() => {
    if (location.state?.nuevoContacto) {
      const nuevo = location.state.nuevoContacto;
      
      setContactos(prev => {
        const existe = prev.find(c => c.id === nuevo.id);
        if (!existe) {
          return [nuevo, ...prev]; 
        }
        return prev;
      });
      
      setContactoActivo(nuevo);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 2. 🚀 CARGAR CONTACTOS (Citas + Historial de Mensajes)
  const cargarContactos = async (userId: string, userRol: string) => {
    try {
      const contactosMap = new Map(); // Usamos un mapa para evitar duplicados

      // --- PASO A: Buscar contactos por CITAS ---
      const columnaFiltro = userRol === 'fisio' ? 'fisioterapeuta_id' : 'paciente_id';
      const columnaRelacion = userRol === 'fisio' ? 'pacientes ( id, nombre_completo )' : 'fisioterapeutas ( id, nombres, apellidos )';

      const { data: citas } = await supabase
        .from('citas')
        .select(`id, ${columnaRelacion}`)
        .eq(columnaFiltro, userId)
        .neq('estado', 'cancelada');

      if (citas) {
        citas.forEach((cita: any) => {
          const persona = userRol === 'fisio' ? cita.pacientes : cita.fisioterapeutas;
          if (persona && !contactosMap.has(persona.id)) {
            contactosMap.set(persona.id, {
              id: persona.id,
              nombre: userRol === 'fisio' ? persona.nombre_completo : `${persona.nombres} ${persona.apellidos}`
            });
          }
        });
      }

      // --- PASO B: Buscar contactos por MENSAJES PREVIOS ---
      const { data: historialMensajes } = await supabase
        .from('mensajes')
        .select('remitente_id, destinatario_id')
        .or(`remitente_id.eq.${userId},destinatario_id.eq.${userId}`);

      if (historialMensajes) {
        const idsAdicionales = new Set<string>();

        // Extraer los IDs de las otras personas con las que chateó
        historialMensajes.forEach((msg) => {
          const otroId = msg.remitente_id === userId ? msg.destinatario_id : msg.remitente_id;
          if (!contactosMap.has(otroId)) {
            idsAdicionales.add(otroId);
          }
        });

        // Si hay personas con las que chateó pero no tenían cita, buscamos sus nombres
        if (idsAdicionales.size > 0) {
          const idsArray = Array.from(idsAdicionales);
          
          if (userRol === 'paciente') {
            const { data: fisiosExtra } = await supabase
              .from('fisioterapeutas')
              .select('id, nombres, apellidos')
              .in('id', idsArray);
              
            fisiosExtra?.forEach(f => {
              contactosMap.set(f.id, {
                id: f.id,
                nombre: `${f.nombres} ${f.apellidos}`
              });
            });
          } else {
            const { data: pacientesExtra } = await supabase
              .from('pacientes')
              .select('id, nombre_completo')
              .in('id', idsArray);
              
            pacientesExtra?.forEach(p => {
              contactosMap.set(p.id, {
                id: p.id,
                nombre: p.nombre_completo
              });
            });
          }
        }
      }

      // --- PASO C: Actualizar el estado ---
      setContactos(prev => {
        const combinados = Array.from(contactosMap.values());
        // Mantener los que acaban de llegar por "state" de react-router (para que no desaparezcan antes del primer mensaje)
        prev.forEach(p => {
          if (!contactosMap.has(p.id)) {
            combinados.unshift(p);
          }
        });
        return combinados;
      });

    } catch (error) {
      console.error("Error cargando contactos:", error);
    }
  };

  // 3. Cargar mensajes del chat seleccionado y suscribirse a Realtime
  useEffect(() => {
    if (!usuarioActual || !contactoActivo) return;

    const fetchMensajes = async () => {
      const { data } = await supabase
        .from('mensajes')
        .select('*')
        .or(`and(remitente_id.eq.${usuarioActual.id},destinatario_id.eq.${contactoActivo.id}),and(remitente_id.eq.${contactoActivo.id},destinatario_id.eq.${usuarioActual.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMensajes(data);
      scrollToBottom();
    };

    fetchMensajes();

    const channel = supabase.channel('chat_en_vivo')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensajes',
        filter: `remitente_id=eq.${contactoActivo.id}`
      }, (payload) => {
        setMensajes((prev) => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactoActivo, usuarioActual]);

  const scrollToBottom = () => {
    setTimeout(() => {
      mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 4. Enviar Mensaje
  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !contactoActivo || !usuarioActual) return;

    const mensajeTemp = {
      id: crypto.randomUUID(),
      remitente_id: usuarioActual.id,
      destinatario_id: contactoActivo.id,
      contenido: nuevoMensaje,
      created_at: new Date().toISOString()
    };

    setMensajes((prev) => [...prev, mensajeTemp]);
    setNuevoMensaje('');
    scrollToBottom();

    await supabase.from('mensajes').insert([{
      remitente_id: usuarioActual.id,
      destinatario_id: contactoActivo.id,
      contenido: mensajeTemp.contenido
    }]);
  };

  const formatearHora = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <div className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-8 shrink-0 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <Link 
            to={rol === 'fisio' ? '/dashboard-fisio' : '/dashboard-paciente'} 
            className="flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] font-bold text-sm transition"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Panel
          </Link>
          <div className="mx-auto font-display font-bold text-lg text-[#0A1E3D]">Mensajería FisioCare</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-grow flex p-4 sm:p-8 gap-6 h-[calc(100vh-64px)]">
        
        <div className={`w-full md:w-80 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 ${contactoActivo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-[#0A1E3D] text-lg mb-4">Mis Conversaciones</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar contacto..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#1A5C3A] transition"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-grow scrollbar-thin">
            {contactos.length > 0 ? (
              contactos.map((contacto) => (
                <button
                  key={contacto.id}
                  onClick={() => setContactoActivo(contacto)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-slate-50 transition text-left ${
                    contactoActivo?.id === contacto.id ? 'bg-[#E8F5EE] border-l-4 border-l-[#1A5C3A]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-sm font-bold truncate ${contactoActivo?.id === contacto.id ? 'text-[#1A5C3A]' : 'text-[#0A1E3D]'}`}>
                      {rol === 'paciente' && 'Dr. '} {contacto.nombre}
                    </p>
                    <p className="text-xs text-slate-400 truncate">Haz clic para ver el chat</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No tienes contactos aún.
              </div>
            )}
          </div>
        </div>

        <div className={`flex-grow bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${!contactoActivo ? 'hidden md:flex md:items-center md:justify-center bg-slate-50/50' : 'flex'}`}>
          
          {!contactoActivo ? (
            <div className="text-center space-y-3">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Send className="h-8 w-8 ml-1" />
              </div>
              <h3 className="font-bold text-slate-400">Tus mensajes</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Selecciona una conversación del menú lateral para comunicarte.</p>
            </div>
          ) : (
            <>
              <div className="h-16 border-b border-slate-100 flex items-center px-6 shrink-0 justify-between bg-white">
                <div className="flex items-center gap-3">
                  <button onClick={() => setContactoActivo(null)} className="md:hidden text-slate-400 hover:text-slate-600 mr-1">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-9 w-9 bg-[#0A1E3D] text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {contactoActivo.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A1E3D] text-sm leading-tight">
                      {rol === 'paciente' && 'Dr. '} {contactoActivo.nombre}
                    </h3>
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span> En línea
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#F8FAF9]">
                {mensajes.length === 0 && (
                  <div className="text-center py-10">
                    <span className="bg-slate-200/50 text-slate-500 text-xs px-4 py-2 rounded-full">
                      Inicio de la conversación segura
                    </span>
                  </div>
                )}
                
                {mensajes.map((msg) => {
                  const esMio = msg.remitente_id === usuarioActual?.id;
                  return (
                    <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-5 py-3 ${
                        esMio ? 'bg-[#0A1E3D] text-white rounded-br-sm shadow-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.contenido}</p>
                        <p className={`text-[10px] text-right mt-1.5 flex items-center justify-end gap-1 ${esMio ? 'text-slate-300' : 'text-slate-400'}`}>
                          <Clock className="h-2.5 w-2.5" /> {formatearHora(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={mensajesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={enviarMensaje} className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition"
                  />
                  <button 
                    type="submit"
                    disabled={!nuevoMensaje.trim()}
                    className="bg-[#1A5C3A] hover:bg-[#124229] text-white w-12 h-12 rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="h-5 w-5 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
