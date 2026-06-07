import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isSelected = (path: string) => location.pathname === path;

  // Lista de enlaces para no repetir código
  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Especialistas', path: '/especialistas' },
    { name: '¿Cómo funcionaaaaaaaaaaa?', path: '/como-funciona' }
  ];

  // Función para cerrar el menú móvil al hacer clic en un enlace
  const closeMenu = () => setIsOpen(false);

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

        {/* Navegación Desktop (Oculta en celular/tablet) */}
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
          
          <Link 
            to="/registro-fisio"
            className="ml-4 bg-[#E8F5EE] text-[#1A6645] px-5 py-2.5 rounded-full text-sm font-bold border border-[#B8E0CA] hover:bg-[#dcf3e7] transition flex items-center gap-1"
          >
            ✦ ¿Eres fisio? Únete
          </Link>
        </div>

        {/* Acciones Desktop */}
        <div className="hidden lg:flex items-center gap-4">
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
          
          {/* Enlaces Móvil */}
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

          {/* Botones Móvil */}
          <div className="flex flex-col gap-3">
            <Link 
              to="/registro-fisio"
              onClick={closeMenu}
              className="bg-[#E8F5EE] text-[#1A6645] px-4 py-3.5 rounded-xl text-sm font-bold border border-[#B8E0CA] flex items-center justify-center gap-2 hover:bg-[#dcf3e7] transition"
            >
              ✦ ¿Eres fisioterapeuta? Únete
            </Link>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
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
            </div>
          </div>

        </div>
      )}
    </nav>
  );
}
