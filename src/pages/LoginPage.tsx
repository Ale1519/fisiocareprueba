import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Eye, EyeOff, Activity, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Autenticación
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw new Error("Correo o contraseña incorrectos.");

      // 2. Obtener rol del usuario (Síncrono con tabla 'usuarios')
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        throw new Error("No se pudo cargar el perfil del usuario.");
      }

      // 3. Redirección basada en rol
      if (userData.rol === 'fisioterapeuta') {
        navigate('/dashboard-fisio');
      } else {
        navigate('/dashboard-paciente');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-[calc(100dvh-5rem)] sm:min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 pb-20 sm:pb-6">
      <div className="w-full max-w-md">
        
        {/* Logo Superior */}
        <div className="flex justify-center mb-8 gap-2 items-center text-[#0A1E3D]">
          <div className="bg-[#0A1E3D] p-2 rounded-xl">
             <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight">FisioCare</span>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-sm border border-slate-100">
          
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition shrink-0">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A1E3D]" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3D]">Bienvenido de nuevo</h2>
          </div>
          
          <p className="text-slate-500 mb-8 ml-10 sm:ml-12 text-sm sm:text-base">Ingresa para continuar</p>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-3 sm:p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div className="relative">
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="w-full pl-4 pr-12 py-3.5 sm:py-4 text-sm sm:text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A1E3D] outline-none transition"
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required 
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                className="w-full pl-4 pr-12 py-3.5 sm:py-4 text-sm sm:text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A1E3D] outline-none transition"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0A1E3D] text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-[#122d5a] transition disabled:opacity-70 mt-2"
            >
              {isLoading ? "Validando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <button onClick={() => navigate('/seleccion-registro')} className="text-[#0A1E3D] font-bold hover:underline">
              Regístrate
            </button>
          </p>
          
        </div>
      </div>
    </div>
  );
}
