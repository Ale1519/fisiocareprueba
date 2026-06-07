import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Activity, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

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
      // 1. Registro en Auth enviando los datos extras en la metadata
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          data: { 
            rol: 'paciente',
            nombre_completo: nombre,
            telefono: telefono
          } 
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 2. Validación de confirmación de correo
        // Si no hay sesión, significa que el usuario debe ir a su correo
        if (!data.session) {
          alert("¡Cuenta creada! Por favor, revisa tu bandeja de entrada o SPAM para confirmar tu correo antes de iniciar sesión.");
          navigate('/login');
          return; // Detenemos la ejecución aquí
        }

        // 3. Inserción/Actualización en pacientes (Si la sesión ya está activa)
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

  return (
    <div className="min-h-[calc(100dvh-5rem)] sm:min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 pb-20 sm:pb-6">
      
      {/* Logo Superior */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8 text-[#0A1E3D]">
        <div className="bg-[#0A1E3D] p-2 rounded-xl">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight">FisioCare</span>
      </div>

      {/* Tarjeta Principal */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-sm border border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3D] mb-1">Crea tu cuenta</h2>
        <p className="text-slate-500 mb-6 text-sm sm:text-base">Empieza a usar FisioCare hoy</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="space-y-1">
            <input 
              type="text" 
              placeholder="Nombre completo" 
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base focus:ring-2 focus:ring-[#0A1E3D] outline-none transition ${nombreError ? 'border-red-500' : 'border-slate-200'}`} 
              onChange={handleNombreChange} 
              required 
            />
            {nombreError && (
              <div className="flex items-center gap-1 text-red-500 text-[11px] sm:text-xs px-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" /> No puedes ingresar números.
              </div>
            )}
          </div>

          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 text-sm sm:text-base focus:ring-2 focus:ring-[#0A1E3D] outline-none transition" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <div className="flex gap-2">
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base text-slate-500 font-medium flex items-center justify-center shrink-0">
              +51
            </div>
            <input 
              type="tel" 
              placeholder="Teléfono" 
              value={telefono} 
              className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 text-sm sm:text-base focus:ring-2 focus:ring-[#0A1E3D] outline-none transition" 
              onChange={handleTelefonoChange} 
              maxLength={9} 
              required 
            />
          </div>

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Contraseña" 
              className="w-full p-3.5 sm:p-4 pr-12 rounded-xl border border-slate-200 text-sm sm:text-base focus:ring-2 focus:ring-[#0A1E3D] outline-none transition" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-[11px] sm:text-xs space-y-1.5 text-slate-600 border border-slate-100">
            <ValidationItem label="Mínimo 8 caracteres" isValid={rules.length} />
            <ValidationItem label="Una letra mayúscula" isValid={rules.upper} />
            <ValidationItem label="Un número" isValid={rules.number} />
            <ValidationItem label="Un carácter especial (@$!%*?&)" isValid={rules.special} />
          </div>

          <button 
            disabled={!isAllValid} 
            type="submit" 
            className="w-full bg-[#0A1E3D] text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-[#122d5a] disabled:opacity-50 transition mt-2"
          >
            Crear cuenta
          </button>

        </form>
      </div>
    </div>
  );
}

function ValidationItem({ label, isValid }: { label: string, isValid: boolean }) {
  return (
    <div className={`flex items-center gap-2 transition-colors duration-300 ${isValid ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
      {isValid ? <Check className="h-3.5 w-3.5" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  );
}
