import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, UploadCloud, ArrowLeft, Check } from 'lucide-react';

export default function Step4Documentos({ formData, onBack }: any) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState({
    url_diploma: '',
    url_certificado_colegiatura: '',
    url_dni: '',
    url_certificado_especializacion: ''
  });

  const uploadFile = async (e: any, field: string) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const cleanName = file.name
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .substring(0, 50);

    const fileName = `${Date.now()}_${cleanName}`;
    
    const { error } = await supabase.storage
      .from('documentos-fisio')
      .upload(fileName, file);

    if (error) { 
      console.error("Error al subir:", error);
      alert('Error al subir archivo: ' + error.message); 
      setLoading(false); 
      return; 
    }

    const { data: publicUrlData } = supabase.storage
      .from('documentos-fisio')
      .getPublicUrl(fileName);

    setDocs(prev => ({ ...prev, [field]: publicUrlData.publicUrl }));
    setLoading(false);
  };

  const submitRegistro = async () => {
      // Validación de documentos obligatorios antes de procesar
      if (!docs.url_diploma || !docs.url_certificado_colegiatura || !docs.url_dni) {
        alert("Por favor, sube todos los documentos obligatorios (*).");
        return;
      }

      setLoading(true);
      try {
        // 1. Crear usuario en Auth
        const { data: auth, error: authError } = await supabase.auth.signUp({ 
          email: formData.email, 
          password: formData.password,
          options: { data: { rol: 'fisioterapeuta' } }
        });
        if (authError) throw authError;

        // VALIDACIÓN CLAVE: Manejo de la Confirmación de Correo
        if (!auth.session) {
          // Guardamos toda la data en el navegador temporalmente
          const registroPendiente = {
            userId: auth.user!.id,
            formData: formData,
            docs: docs
          };
          localStorage.setItem('registroFisioPendiente', JSON.stringify(registroPendiente));
          
          alert("¡Cuenta creada con éxito!\n\nTe hemos enviado un enlace de confirmación. Por favor, revisa tu correo (y la carpeta de SPAM), confirma tu cuenta e inicia sesión para finalizar la creación de tu perfil.");
          
          setLoading(false);
          // Opcional: Redirigir a la pantalla de login
          // window.location.href = '/login';
          return; // Detenemos la ejecución aquí para evitar el error RLS
        }

        const userId = auth.user!.id;

        // 2. Insertar en tabla fisioterapeutas
        const { error: fisioError } = await supabase.from('fisioterapeutas').insert([{
          id: userId,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          celular: formData.celular,
          colegiatura: formData.colegiatura,
          anos_experiencia: parseInt(formData.anos_experiencia) || 0,
          precio_sesion: parseFloat(formData.precio_sesion) || 0,
          ofrece_domicilio: formData.ofrece_domicilio,
          ofrece_videollamada: formData.ofrece_videollamada,
          bio: formData.bio,
          ...docs
        }]);
        if (fisioError) throw fisioError;

        // 3. Guardar especialidades 
        if (formData.especialidades && formData.especialidades.length > 0) {
          const espToInsert = formData.especialidades.map((uuid: string) => ({
            fisioterapeuta_id: userId,
            especialidad_id: uuid
          }));
          const { error: espError } = await supabase.from('fisioterapeuta_especialidades').insert(espToInsert);
          if (espError) throw espError;
        }

        // 4. Guardar distritos en la tabla intermedia
        if (formData.distritos_seleccionados && formData.distritos_seleccionados.length > 0) {
          // NOTA: Asegúrate de que el backend guarde IDs de distritos y no nombres si la tabla pide IDs
          // Esto asume que el arreglo trae los UUIDs correctos.
          const distToInsert = formData.distritos_seleccionados.map((uuid: string) => ({
            fisioterapeuta_id: userId,
            distrito_id: uuid
          }));
          const { error: distError } = await supabase.from('fisioterapeuta_distritos').insert(distToInsert);
          if (distError) throw distError;
        }

        alert("¡Registro enviado a verificación!");
        
      } catch (e: any) { 
        console.error("Error final:", e);
        alert("Error: " + (e.message || "Error inesperado al registrar")); 
      }
      setLoading(false);
    };

  return (
    <div className="space-y-6">
      <h3 className="text-xl sm:text-2xl font-bold text-[#0A1E3D]">Documentos de verificación</h3>
      
      <div className="space-y-3 sm:space-y-4">
        {[
          { id: 'url_diploma', label: 'Diploma de fisioterapia *' },
          { id: 'url_certificado_colegiatura', label: 'Certificado de colegiatura *' },
          { id: 'url_dni', label: 'DNI (anverso y reverso) *' },
          { id: 'url_certificado_especializacion', label: 'Certificados (opcional)' }
        ].map(doc => (
          <div key={doc.id} className="border border-slate-200 rounded-xl p-3.5 sm:p-4 flex justify-between items-center bg-white shadow-sm hover:border-slate-300 transition-colors gap-3">
            <span className="text-sm sm:text-base font-medium text-slate-700 leading-tight">{doc.label}</span>
            {docs[doc.id as keyof typeof docs] ? (
              <div className="flex items-center gap-1 sm:gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm shrink-0">
                <CheckCircle2 className="h-4 w-4" /> <span className="hidden sm:inline">Subido</span>
              </div>
            ) : (
              <label className="cursor-pointer bg-slate-50 border border-slate-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-[#0A1E3D] transition flex items-center gap-2 shrink-0">
                <UploadCloud className="h-4 w-4" /> <span className="hidden sm:inline">Subir archivo</span>
                <input type="file" className="hidden" onChange={(e) => uploadFile(e, doc.id)} />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
        <button 
          onClick={onBack} 
          disabled={loading}
          className="w-full sm:w-1/3 p-3.5 sm:p-4 border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button 
          onClick={submitRegistro} 
          disabled={loading}
          className="w-full sm:w-2/3 bg-[#1A5C3A] text-white py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#124229] transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Procesando...
            </span>
          ) : (
            <>Enviar para verificación <Check className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
