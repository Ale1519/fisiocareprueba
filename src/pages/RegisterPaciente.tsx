import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Activity, Eye, EyeOff, ArrowLeft, Check, X, AlertCircle } from 'lucide-react';

export default function RegisterPaciente() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombreError, setNombreError] = useState(false);
  const navigate = useNavigate();

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombreError(/\d/.test(val));
    setNombre(val);
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) setTelefono(val);
  };

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isAllValid = Object.values(rules).every(Boolean) && nombre.length > 0 && !nombreError && telefono.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllValid) return;

    try {
      // 1. Registro en Auth
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { rol: 'paciente' } } // Pasamos el rol aquí
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 2. Inserción/Actualización en pacientes
        // Upsert evita errores de duplicidad si el Trigger ya creó el registro base
        const { error: profileError } = await supabase.from('pacientes').upsert([{ 
          id: data.user.id, 
          nombre_completo: nombre, 
          telefono 
        }]);

        if (profileError) throw profileError;
        
        alert("Cuenta creada con éxito");
        navigate('/dashboard-paciente');
      }
    } catch (err: any) {
      console.error("Error detallado:", err);
      alert("Error al registrar: " + err.message);
    }
  };

  // ... resto del JSX igual que tenías ...
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4">
      <div className="flex items-center gap-2 mb-8 text-[#0A1E3D]">
        <div className="bg-[#0A1E3D] p-2 rounded-xl"><Activity className="h-6 w-6 text-white" /></div>
        <span className="text-2xl font-bold tracking-tight">FisioCare</span>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-[#0A1E3D] mb-1">Crea tu cuenta</h2>
        <p className="text-slate-500 mb-6">Empieza a usar FisioCare hoy</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <input type="text" placeholder="Nombre completo" className={`w-full p-4 rounded-xl border ${nombreError ? 'border-red-500' : 'border-slate-200'}`} onChange={handleNombreChange} required />
            {nombreError && <div className="flex items-center gap-1 text-red-500 text-xs px-1"><AlertCircle className="h-3 w-3" /> No puedes ingresar números.</div>}
          </div>

          <input type="email" placeholder="Correo electrónico" className="w-full p-4 rounded-xl border border-slate-200" onChange={(e) => setEmail(e.target.value)} required />

          <div className="flex gap-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium">+51</div>
            <input type="tel" placeholder="Teléfono" value={telefono} className="w-full p-4 rounded-xl border border-slate-200" onChange={handleTelefonoChange} maxLength={9} required />
          </div>

          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Contraseña" className="w-full p-4 rounded-xl border border-slate-200" onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-600">
            <ValidationItem label="Mínimo 8 caracteres" isValid={rules.length} />
            <ValidationItem label="Una letra mayúscula" isValid={rules.upper} />
            <ValidationItem label="Un número" isValid={rules.number} />
            <ValidationItem label="Un carácter especial (@$!%*?&)" isValid={rules.special} />
          </div>

          <button disabled={!isAllValid} type="submit" className="w-full bg-[#0A1E3D] text-white py-4 rounded-xl font-bold hover:bg-[#122d5a] disabled:opacity-50 transition">
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}

function ValidationItem({ label, isValid }: { label: string, isValid: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-slate-400'}`}>
      {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  );
}