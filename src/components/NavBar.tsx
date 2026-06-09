import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados para la sesión
  const [user, setUser] = useState<any>(null);
  const [rol, setRol] = useState<'paciente' | 'fisio' | null>(null);
  
  const isSelected = (path: string) => location.pathname === path;

  // 🧠 LÓGICA DINÁMICA: Si es fisio, ocultamos 'Especialistas'
  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Especialistas', path: '/especialistas' },
    { name: '¿Cómo funciona?', path: '/como-funciona' }
  ].filter(link => {
    if (rol === 'fisio' && link.name === 'Especialistas') return false;
    return true;
  });

  // Función para cerrar el menú móvil al hacer clic en un enlace
  const closeMenu = () => setIsOpen(false);

  // EFECTO DE AUTENTICACIÓN
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) determinarRol(session.user.id);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        determinarRol(session.user.id);
      } else {
        setRol(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const determinarRol = async (userId: string) => {
    const { data: fisio } = await supabase
      .from('fisioterapeutas')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (fisio) {
      setRol('fisio');
    } else {
      setRol('paciente');
    }
  };

  // 🚀 MEJORA: Ventana de confirmación antes de cerrar sesión
  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
          <div className="bg-[#0A1E3D] p-2 rounded-xl transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0A1E3D] tracking-tight">FisioCare</span>
        </Link>

        {/* Navegación Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isSelected(item.path) 
                  ? 'bg-sky-50 text-sky-700' 
                  : 'text-slate-600 hover:text-[#0A1E3D] hover:bg-slate-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Acciones Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            // VISTA LOGUEADO: Botones de Panel y Salir Mejorado
            <div className="flex items-center gap-3">
              <Link 
                to={rol === 'fisio' ? '/dashboard-fisio' : '/dashboard-paciente'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-[#0A1E3D] transition-all border border-slate-200"
              >
                <LayoutDashboard className="h-4 w-4" />
                Mi Panel
              </Link>
              
              {/* Botón Salir pulido estilo SaaS */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100/60 hover:border-red-200 transition-all shadow-sm"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </div>
          ) : (
            // VISTA VISITANTE
            <>
              <Link 
                to="/login"
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
              >
                Iniciar sesión
              </Link>
              <Link 
                to="/seleccion-registro"
                className="bg-[#0A1E3D] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#122d5a] transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Botón Menú Hamburguesa (Solo Móvil) */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-600 hover:text-[#0A1E3D] focus:outline-none p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable (Solo Móvil) */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-5 px-6 flex flex-col gap-5 slide-down">
          
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={closeMenu}
                className={`px-4 py-3.5 rounded-xl text-base font-semibold transition ${
                  isSelected(item.path) 
                    ? 'bg-sky-50 text-sky-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0A1E3D]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="h-px bg-slate-100"></div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 mt-2">
              {user ? (
                <>
                  <Link 
                    to={rol === 'fisio' ? '/dashboard-fisio' : '/dashboard-paciente'}
                    onClick={closeMenu}
                    className="flex justify-center items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-[#0A1E3D] border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Panel
                  </Link>
                  <button 
                    onClick={() => { closeMenu(); handleLogout(); }}
                    className="flex justify-center items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-red-100 transition shadow-sm"
                  >
                    <LogOut className="h-4 w-4" /> Salir
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    onClick={closeMenu}
                    className="flex justify-center items-center px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Iniciar sesión
                  </Link>
                  <Link 
                    to="/seleccion-registro"
                    onClick={closeMenu}
                    className="flex justify-center items-center bg-[#0A1E3D] text-white px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-[#122d5a] transition"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </nav>
  );
}
