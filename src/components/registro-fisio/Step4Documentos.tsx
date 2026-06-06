import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';

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
    setLoading(true);
    try {
      // 1. Crear usuario en Auth
      const { data: auth, error: authError } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: { data: { rol: 'fisioterapeuta' } }
      });
      if (authError) throw authError;
      const userId = auth.user!.id;

      // 2. Insertar en tabla fisioterapeutas
      // Nota: No insertamos en 'usuarios' manualmente; el trigger de la BD lo hace solo.
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

      // 3. Guardar especialidades (formData.especialidades ahora contiene UUIDs)
      if (formData.especialidades && formData.especialidades.length > 0) {
        const espToInsert = formData.especialidades.map((uuid: string) => ({
          fisioterapeuta_id: userId,
          especialidad_id: uuid
        }));
        const { error: espError } = await supabase.from('fisioterapeuta_especialidades').insert(espToInsert);
        if (espError) throw espError;
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
      <h3 className="font-bold text-lg">Documentos de verificación</h3>
      
      {[
        { id: 'url_diploma', label: 'Diploma de fisioterapia *' },
        { id: 'url_certificado_colegiatura', label: 'Certificado de colegiatura *' },
        { id: 'url_dni', label: 'DNI (anverso y reverso) *' },
        { id: 'url_certificado_especializacion', label: 'Certificados (opcional)' }
      ].map(doc => (
        <div key={doc.id} className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium">{doc.label}</span>
          {docs[doc.id as keyof typeof docs] ? (
            <Check className="text-green-600" />
          ) : (
            <label className="cursor-pointer bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold">
              Subir <input type="file" className="hidden" onChange={(e) => uploadFile(e, doc.id)} />
            </label>
          )}
        </div>
      ))}

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="w-1/3 p-4 border rounded-xl font-bold">Atrás</button>
        <button 
          onClick={submitRegistro} 
          disabled={loading}
          className="w-2/3 bg-[#1A5C3A] text-white py-4 rounded-xl font-bold"
        >
          {loading ? 'Procesando...' : 'Enviar para verificación'}
        </button>
      </div>
    </div>
  );
}