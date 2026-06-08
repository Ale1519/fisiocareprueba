import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Save, ArrowLeft, CheckCircle2, Stethoscope, DollarSign, 
  Home, Video, AlignLeft, UploadCloud, File as FileIcon, X 
} from 'lucide-react';

export default function PerfilFisio() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

  // Estados del formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [sobreMi, setSobreMi] = useState('');
  const [precioSesion, setPrecioSesion] = useState<number | ''>('');
  const [ofreceDomicilio, setOfreceDomicilio] = useState(false);
  const [ofreceVideollamada, setOfreceVideollamada] = useState(false);
  
  // Estado para los documentos
  const [archivos, setArchivos] = useState<File[]>([]);

  const listaEspecialidades = [
    'Deportiva', 'Traumatológica', 'Neurológica', 'Geriátrica', 
    'Pediátrica', 'Post-operatoria', 'Terapia Manual', 'Dolor Crónico'
  ];

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: fisio } = await supabase
          .from('fisioterapeutas')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fisio) {
          setNombres(fisio.nombres || '');
          setApellidos(fisio.apellidos || '');
          // Convertimos el string separado por comas de la BD en un array para los botones
          setEspecialidades(fisio.especialidad ? fisio.especialidad.split(', ') : []);
          setSobreMi(fisio.sobre_mi || '');
          setPrecioSesion(fisio.precio_sesion || '');
          setOfreceDomicilio(fisio.ofrece_domicilio || false);
          setOfreceVideollamada(fisio.ofrece_videollamada || false);
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  const toggleEspecialidad = (esp: string) => {
    setEspecialidades(prev => 
      prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
    );
  };

  const manejarSubidaArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivos(prev => [...prev, ...nuevosArchivos]);
    }
  };

  const quitarArchivo = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      // 1. Guardar datos en la tabla fisioterapeutas
      const { error } = await supabase
        .from('fisioterapeutas')
        .update({
          nombres,
          apellidos,
          especialidad: especialidades.join(', '), // Lo volvemos a unir como texto para la BD
          sobre_mi: sobreMi,
          precio_sesion: precioSesion === '' ? null : Number(precioSesion),
          ofrece_domicilio: ofreceDomicilio,
          ofrece_videollamada: ofreceVideollamada
        })
        .eq('id', user.id);

      if (error) throw error;

      // 2. Aquí iría la lógica de subir los "archivos" al Storage de Supabase si hay nuevos.
      // if (archivos.length > 0) { ... lógica de subida ... }

      setMensaje({ tipo: 'exito', texto: '¡Tu perfil profesional ha sido actualizado!' });
      setTimeout(() => setMensaje(null), 3000);

    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Hubo un problema al guardar: ' + error.message });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ENCABEZADO Y NAVEGACIÓN */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/dashboard-fisio" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] font-medium transition mb-4">
              <ArrowLeft className="h-4 w-4" /> Volver a mi panel
            </Link>
            <h1 className="text-3xl font-extrabold text-[#0A1E3D]">Editar Perfil Profesional</h1>
            <p className="text-slate-500 mt-1">La información que coloques aquí será visible para los pacientes.</p>
          </div>
        </div>

        <form onSubmit={guardarCambios} className="space-y-6">
          
          {/* Alerta */}
          {mensaje && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-fadeIn shadow-sm ${
              mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {mensaje.tipo === 'exito' && <CheckCircle2 className="h-5 w-5" />}
              <p className="text-sm font-bold">{mensaje.texto}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMNA 1: Datos Personales e Info */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Tarjeta 1: Identidad */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-4">
                  <User className="h-5 w-5 text-[#1A5C3A]" /> Datos Personales
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nombres</label>
                    <input
                      type="text" required value={nombres} onChange={(e) => setNombres(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Apellidos</label>
                    <input
                      type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Perfil Profesional (AHORA CON BOTONES) */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Stethoscope className="h-5 w-5 text-[#1A5C3A]" /> Perfil Profesional
                </h2>
                
                <div className="space-y-6">
                  {/* Especialidades */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">Especialidades</label>
                    <div className="flex flex-wrap gap-2">
                      {listaEspecialidades.map((esp) => (
                        <button
                          type="button"
                          key={esp}
                          onClick={() => toggleEspecialidad(esp)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            especialidades.includes(esp)
                              ? 'bg-[#1A5C3A] text-white border-[#1A5C3A] shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1A5C3A] hover:bg-slate-50'
                          }`}
                        >
                          {esp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Biografía */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-slate-400" /> Sobre ti (Biografía)
                    </label>
                    <textarea
                      rows={5} value={sobreMi} onChange={(e) => setSobreMi(e.target.value)} placeholder="Cuéntale a tus pacientes sobre tu experiencia, tu enfoque de tratamiento y qué resultados pueden esperar..."
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition resize-none"
                    />
                    <p className="text-xs text-slate-400">Esta es tu carta de presentación, destaca lo que te hace único.</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Documentos (NUEVO) */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-4">
                  <UploadCloud className="h-5 w-5 text-[#1A5C3A]" /> Documentos de Verificación
                </h2>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Sube aquí tu colegiatura (CTMP), DNI o certificados adicionales si no los cargaste en el registro.</p>
                  
                  {/* Área de Dropzone */}
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-[#1A5C3A] transition">
                    <input type="file" multiple className="hidden" id="file-upload" onChange={manejarSubidaArchivos} />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 mb-3">
                        <UploadCloud className="h-6 w-6 text-[#1A5C3A]" />
                      </div>
                      <span className="text-sm font-bold text-[#0A1E3D]">Haz clic para subir archivos</span>
                      <span className="text-xs text-slate-400 mt-1">Formatos permitidos: PDF, JPG, PNG (Max. 5MB)</span>
                    </label>
                  </div>

                  {/* Lista de archivos subidos temporalmente */}
                  {archivos.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archivos listos para guardar</p>
                      {archivos.map((archivo, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileIcon className="h-4 w-4 text-[#1A5C3A] shrink-0" />
                            <span className="text-sm font-semibold text-slate-700 truncate">{archivo.name}</span>
                          </div>
                          <button type="button" onClick={() => quitarArchivo(index)} className="text-red-400 hover:text-red-600 p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* COLUMNA 2: Tarifas y Servicios */}
            <div className="space-y-6">
              
              {/* Tarifas */}
              <div className="bg-[#0A1E3D] rounded-3xl p-6 md:p-8 shadow-sm text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <DollarSign className="h-32 w-32" />
                </div>
                
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 relative z-10">
                  <DollarSign className="h-5 w-5 text-emerald-400" /> Tarifas
                </h2>
                
                <div className="space-y-2 relative z-10">
                  <label className="text-sm font-bold text-slate-300">Precio por sesión (S/)</label>
                  <input
                    type="number" required min="0" step="0.5" value={precioSesion} onChange={(e) => setPrecioSesion(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-lg font-bold text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Configuración de Servicios */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-[#0A1E3D] flex items-center gap-2 border-b border-slate-100 pb-4">
                  Configuración
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-slate-50 cursor-pointer transition group">
                    <div className="mt-1">
                      <input 
                        type="checkbox" checked={ofreceDomicilio} onChange={(e) => setOfreceDomicilio(e.target.checked)}
                        className="w-5 h-5 accent-[#1A5C3A] rounded border-slate-300 focus:ring-[#1A5C3A]"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-[#0A1E3D] flex items-center gap-2"><Home className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" /> A Domicilio</p>
                      <p className="text-xs text-slate-500 mt-1">Me desplazo a la casa del paciente.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#1A5C3A] hover:bg-slate-50 cursor-pointer transition group">
                    <div className="mt-1">
                      <input 
                        type="checkbox" checked={ofreceVideollamada} onChange={(e) => setOfreceVideollamada(e.target.checked)}
                        className="w-5 h-5 accent-[#1A5C3A] rounded border-slate-300 focus:ring-[#1A5C3A]"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-[#0A1E3D] flex items-center gap-2"><Video className="h-4 w-4 text-slate-400 group-hover:text-[#1A5C3A]" /> Videollamada</p>
                      <p className="text-xs text-slate-500 mt-1">Atiendo de manera remota (Online).</p>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-end sticky bottom-6 z-20">
            <button
              type="submit" disabled={guardando}
              className="bg-[#1A5C3A] hover:bg-[#124229] text-white px-8 py-4 rounded-xl font-extrabold text-sm transition shadow-lg shadow-[#1A5C3A]/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto justify-center"
            >
              {guardando ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Guardando...</>
              ) : (
                <><Save className="h-5 w-5" /> Guardar Perfil</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
