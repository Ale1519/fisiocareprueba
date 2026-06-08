import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Save, ArrowLeft, CheckCircle2, Stethoscope, DollarSign, 
  Home, Video, AlignLeft, UploadCloud, MapPin, FileText, Check
} from 'lucide-react';

export default function PerfilFisio() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

  // Estados del formulario (Coinciden con tu tabla fisioterapeutas)
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [bio, setBio] = useState(''); // <-- Ahora usa 'bio'
  const [precioSesion, setPrecioSesion] = useState<number | ''>('');
  const [ofreceDomicilio, setOfreceDomicilio] = useState(false);
  const [ofreceVideollamada, setOfreceVideollamada] = useState(false);
  
  // Estados de opciones múltiples relacionales (BD)
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<string[]>([]);
  const [listaEspecialidadesBD, setListaEspecialidadesBD] = useState<any[]>([]);
  
  const [distritosSeleccionados, setDistritosSeleccionados] = useState<string[]>([]);
  const [listaDistritosBD, setListaDistritosBD] = useState<any[]>([]);

  // Estado para los 4 documentos oficiales
  const [documentos, setDocumentos] = useState({
    diploma: null as File | null,
    colegiatura: null as File | null,
    dni: null as File | null,
    certificados: null as File | null
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Cargar Catálogos (Distritos y Especialidades)
        const [resDistritos, resEspecialidades] = await Promise.all([
          supabase.from('distritos').select('id, nombre').order('nombre'),
          supabase.from('especialidades').select('id, nombre').order('nombre')
        ]);

        if (resDistritos.data) setListaDistritosBD(resDistritos.data);
        if (resEspecialidades.data) setListaEspecialidadesBD(resEspecialidades.data);

        // 2. Cargar datos del fisio y sus relaciones
        const { data: fisio, error: errorFisio } = await supabase
          .from('fisioterapeutas')
          .select(`
            *,
            fisioterapeuta_distritos ( distrito_id ),
            fisioterapeuta_especialidades ( especialidad_id )
          `)
          .eq('id', user.id)
          .single();

        if (errorFisio) throw errorFisio;

        if (fisio) {
          // Asignación directa a las columnas reales de tu BD
          setNombres(fisio.nombres || '');
          setApellidos(fisio.apellidos || '');
          setBio(fisio.bio || ''); // ¡Columna correcta!
          setPrecioSesion(fisio.precio_sesion || '');
          setOfreceDomicilio(fisio.ofrece_domicilio || false);
          setOfreceVideollamada(fisio.ofrece_videollamada || false);

          // Mapear distritos seleccionados
          if (fisio.fisioterapeuta_distritos) {
            setDistritosSeleccionados(fisio.fisioterapeuta_distritos.map((fd: any) => fd.distrito_id));
          }

          // Mapear especialidades seleccionadas
          if (fisio.fisioterapeuta_especialidades) {
            setEspecialidadesSeleccionadas(fisio.fisioterapeuta_especialidades.map((fe: any) => fe.especialidad_id));
          }
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const toggleEspecialidad = (id: string) => {
    setEspecialidadesSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleDistrito = (id: string) => {
    setDistritosSeleccionados(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const manejarArchivo = (tipo: keyof typeof documentos, archivo: File | null) => {
    setDocumentos(prev => ({ ...prev, [tipo]: archivo }));
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      // 1. Actualizar tabla principal (Sin incluir 'especialidad' porque no existe ahí)
      const { error: errorFisio } = await supabase
        .from('fisioterapeutas')
        .update({
          nombres,
          apellidos,
          bio, // <-- Se guarda directo en tu columna bio
          precio_sesion: precioSesion === '' ? null : Number(precioSesion),
          ofrece_domicilio: ofreceDomicilio,
          ofrece_videollamada: ofreceVideollamada
        })
        .eq('id', user.id);

      if (errorFisio) throw errorFisio;

      // 2. Lógica para Distritos: Borrar antiguos e insertar la nueva selección
      await supabase.from('fisioterapeuta_distritos').delete().eq('fisioterapeuta_id', user.id);
      if (distritosSeleccionados.length > 0) {
        await supabase.from('fisioterapeuta_distritos').insert(
          distritosSeleccionados.map(dId => ({ fisioterapeuta_id: user.id, distrito_id: dId }))
        );
      }

      // 3. Lógica para Especialidades: Borrar antiguas e insertar la nueva selección
      await supabase.from('fisioterapeuta_especialidades').delete().eq('fisioterapeuta_id', user.id);
      if (especialidadesSeleccionadas.length > 0) {
        await supabase.from('fisioterapeuta_especialidades').insert(
          especialidadesSeleccionadas.map(eId => ({ fisioterapeuta_id: user.id, especialidad_id: eId }))
        );
      }

      setMensaje({ tipo: 'exito', texto: '¡Perfil y configuración guardados correctamente!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMensaje(null), 3000);

    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A1E3D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/dashboard-fisio" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] font-medium transition mb-4">
              <ArrowLeft className="h-4 w-4" /> Volver a mi panel
            </Link>
            <h1 className="text-3xl font-extrabold text-[#0A1E3D]">Editar Perfil Profesional</h1>
            <p className="text-slate-500 mt-1">Completa tu información, distritos, especialidades y documentos.</p>
          </div>
        </div>

        <form onSubmit={guardarCambios} className="space-y-6">
          
          {mensaje && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-fadeIn shadow-sm ${
              mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {mensaje.tipo === 'exito' && <CheckCircle2 className="h-5 w-5" />}
              <p className="text-sm font-bold">{mensaje.texto}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA 1: Datos Personales e Info (Izquierda) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tarjeta 1: Identidad */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-4">
                  <User className="h-5 w-5 text-[#1A5C3A]" /> Datos Personales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nombres</label>
                    <input type="text" required value={nombres} onChange={(e) => setNombres(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Apellidos</label>
                    <input type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition" />
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Perfil Profesional */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Stethoscope className="h-5 w-5 text-[#1A5C3A]" /> Perfil Profesional
                </h2>
                
                <div className="space-y-6">
                  {/* Especialidades Dinámicas desde BD */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700">Especialidades</label>
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{especialidadesSeleccionadas.length} seleccionadas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {listaEspecialidadesBD.map((esp) => (
                        <button
                          type="button" key={esp.id} onClick={() => toggleEspecialidad(esp.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            especialidadesSeleccionadas.includes(esp.id)
                              ? 'bg-[#1A5C3A] text-white border-[#1A5C3A] shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1A5C3A] hover:bg-slate-50'
                          }`}
                        >
                          {esp.nombre}
                        </button>
                      ))}
                      {listaEspecialidadesBD.length === 0 && <p className="text-sm text-slate-400 italic">Cargando especialidades...</p>}
                    </div>
                  </div>

                  {/* Biografía */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-slate-400" /> Sobre ti (Biografía)
                    </label>
                    <textarea
                      rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntale a tus pacientes sobre tu experiencia, tu enfoque de tratamiento..."
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Zonas de Cobertura (Distritos) */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#1A5C3A]" /> Zonas de Cobertura
                  </h2>
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    {distritosSeleccionados.length} seleccionados
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                  {listaDistritosBD.map((distrito) => (
                    <button
                      type="button" key={distrito.id} onClick={() => toggleDistrito(distrito.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        distritosSeleccionados.includes(distrito.id)
                          ? 'bg-[#0A1E3D] text-white border-[#0A1E3D] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#0A1E3D] hover:bg-slate-50'
                      }`}
                    >
                      {distrito.nombre}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* COLUMNA 2: Tarifas, Servicios y Documentos (Derecha) */}
            <div className="space-y-6">
              
              {/* Tarifas */}
              <div className="bg-[#0A1E3D] rounded-3xl p-6 md:p-8 shadow-sm text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="h-32 w-32" /></div>
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 relative z-10">
                  <DollarSign className="h-5 w-5 text-emerald-400" /> Tarifas
                </h2>
                <div className="space-y-2 relative z-10">
                  <label className="text-sm font-bold text-slate-300">Precio por sesión (S/)</label>
                  <input type="number" required min="0" step="0.5" value={precioSesion} onChange={(e) => setPrecioSesion(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-lg font-bold text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition" placeholder="0.00" />
                </div>
              </div>

              {/* Configuración de Servicios */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h2 className="text-lg font-bold text-[#0A1E3D] border-b border-slate-100 pb-3">Modalidades</h2>
                
                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-slate-50 cursor-pointer transition group">
                  <div className="mt-1"><input type="checkbox" checked={ofreceDomicilio} onChange={(e) => setOfreceDomicilio(e.target.checked)} className="w-5 h-5 accent-[#1A5C3A] rounded" /></div>
                  <div>
                    <p className="font-bold text-[#0A1E3D] flex items-center gap-2"><Home className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" /> A Domicilio</p>
                    <p className="text-xs text-slate-500 mt-1">Voy a la casa del paciente.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-slate-50 cursor-pointer transition group">
                  <div className="mt-1"><input type="checkbox" checked={ofreceVideollamada} onChange={(e) => setOfreceVideollamada(e.target.checked)} className="w-5 h-5 accent-[#1A5C3A] rounded" /></div>
                  <div>
                    <p className="font-bold text-[#0A1E3D] flex items-center gap-2"><Video className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" /> Videollamada</p>
                    <p className="text-xs text-slate-500 mt-1">Atención remota.</p>
                  </div>
                </label>
              </div>

              {/* Tarjeta 4: Carga de 4 Documentos */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UploadCloud className="h-5 w-5 text-[#1A5C3A]" /> Documentos
                </h2>
                <p className="text-xs text-slate-500">Añade los archivos que te faltaron en el registro.</p>
                
                <div className="space-y-3">
                  {[
                    { id: 'diploma', label: 'Diploma de Fisioterapia' },
                    { id: 'colegiatura', label: 'Certificado de Colegiatura' },
                    { id: 'dni', label: 'DNI (Anverso y Reverso)' },
                    { id: 'certificados', label: 'Certificados (Opcional)' }
                  ].map((doc) => (
                    <div key={doc.id} className="relative">
                      <input 
                        type="file" id={doc.id} className="hidden" 
                        onChange={(e) => manejarArchivo(doc.id as any, e.target.files ? e.target.files[0] : null)}
                      />
                      <label htmlFor={doc.id} className={`flex items-center justify-between p-3 rounded-xl border border-dashed cursor-pointer transition ${documentos[doc.id as keyof typeof documentos] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-300 hover:border-[#1A5C3A]'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2 rounded-lg ${documentos[doc.id as keyof typeof documentos] ? 'bg-emerald-100' : 'bg-white'}`}>
                            {documentos[doc.id as keyof typeof documentos] ? <Check className="h-4 w-4 text-emerald-600" /> : <FileText className="h-4 w-4 text-slate-400" />}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-700">{doc.label}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {documentos[doc.id as keyof typeof documentos] ? documentos[doc.id as keyof typeof documentos]?.name : 'Subir archivo...'}
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Botón Flotante para Guardar */}
          <div className="pt-6 border-t border-slate-200 flex justify-end sticky bottom-6 z-20">
            <button
              type="submit" disabled={guardando}
              className="bg-[#1A5C3A] hover:bg-[#124229] text-white px-10 py-4 rounded-xl font-extrabold text-sm transition shadow-xl shadow-[#1A5C3A]/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto justify-center"
            >
              {guardando ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Guardando...</>
              ) : (
                <><Save className="h-5 w-5" /> Guardar Perfil Completo</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
