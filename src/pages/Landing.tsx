import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  MapPin,
  Heart,
  Search,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased font-body flex flex-col overflow-x-hidden">

      {/* ── HERO ── */}
      <header id="inicio" className="bg-[#F2F6FA] border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-16 lg:pt-24 lg:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-7">

            <div className="inline-flex items-center gap-2 tag-badge bg-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm/50">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              Fisioterapeuta verificados en Lima.
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold text-[#0A1E3D] leading-[1.1] tracking-tight">
              Encuentra tu<br className="hidden sm:block" />
              <em className="not-italic text-[#0A1E3D] block sm:inline mt-2 sm:mt-0">fisioterapeuta<br className="hidden sm:block" />verificado</em>,{' '}
              donde estés
            </h1>

            <p className="text-slate-500 text-base leading-relaxed max-w-md font-light">
              Reserva sesiones a domicilio o por videollamada con profesionales colegiados. Recupérate con confianza, en tus tiempos.
            </p>

            {/* BOTONES HERO */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/registro-paciente')} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0A1E3D] text-white font-medium transition hover:bg-[#1E3A6E]"
              >
                Soy paciente <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigate('/registro-fisio')} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-medium transition hover:bg-slate-50"
              >
                Soy fisioterapeuta <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-4">
              <div className="flex -space-x-2.5">
                {['#1E40AF', '#1D4ED8', '#2563EB', '#3B82F6'].map((c, i) => (
                  <div key={i} className="h-9 w-9 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="text-[#0A1E3D] font-bold text-sm ml-1">4.9</span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">+2,000 sesiones realizadas</p>
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className="lg:col-span-6 relative mt-8 lg:mt-0">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] w-full">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80"
                alt="Sesión de fisioterapia"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E3D]/30 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:bottom-6 md:left-[-2rem] md:translate-x-0 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 w-[90%] max-w-[260px] sm:max-w-[230px]">
              <div className="bg-[#EBF5FF] p-2 sm:p-2.5 rounded-xl shrink-0">
                <Calendar className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Próxima sesión</p>
                <p className="text-xs sm:text-sm font-bold text-[#0A1E3D] mt-0.5 truncate">Mañana 11:00 — Domicilio</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ── POR QUÉ FISIOCARE ── */}
      <section className="bg-white py-16 lg:py-24 mt-8 md:mt-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-12 lg:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1E3D] mb-3">¿Por qué FisioCare?</h2>
            <p className="text-slate-400 text-sm font-light">Diseñado para que tu recuperación sea simple y segura.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Shield className="h-6 w-6" />,
                title: 'Profesionales verificados',
                desc: 'Todos nuestros fisioterapeutas tienen colegiatura validada y documentación al día.',
                color: 'bg-[#EBF0FF] text-[#2563EB]',
              },
              {
                icon: <MapPin className="h-6 w-6" />,
                title: 'A domicilio o por video',
                desc: 'Atención en tu hogar en Lima o sesiones online desde donde estés.',
                color: 'bg-[#E8F5EE] text-[#1A6645]',
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: 'Cuidado personalizado',
                desc: 'Reseñas reales, especialidades claras y precios transparentes para elegir mejor.',
                color: 'bg-[#FEF3F2] text-[#E03B2A]',
              },
            ].map(({ icon, title, desc, color }, idx) => (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition duration-300 space-y-4 sm:space-y-5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color}`}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#0A1E3D] mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-16 lg:py-24 bg-[#F2F6FA] border-t border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-16 lg:mb-20">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1E3D] mb-3">Cómo funciona</h2>
            <p className="text-slate-400 text-sm font-light">En 3 simples pasos estás en sesión.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8">
            {[
              { num: '1', icon: <Search className="h-6 w-6" />, title: 'Busca', desc: 'Filtra por modalidad, distrito, precio y especialidad.' },
              { num: '2', icon: <UserCheck className="h-6 w-6" />, title: 'Elige y agenda', desc: 'Revisa perfiles, reseñas y reserva el horario que prefieras.' },
              { num: '3', icon: <Calendar className="h-6 w-6" />, title: 'Recibe tu sesión', desc: 'Paga seguro con Yape o tarjeta y empieza tu recuperación.' },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} className="bg-white rounded-[1.5rem] px-6 pt-10 pb-8 flex flex-col items-center justify-center min-h-[190px] relative shadow-sm">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 bg-[#1E3A6E] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-4 border-[#F2F6FA]">
                  {num}
                </div>
                <div className="h-14 w-14 bg-[#E8F5EE] text-[#1A6645] rounded-2xl flex items-center justify-center mb-5">
                  {icon}
                </div>
                <div className="text-center space-y-1.5 max-w-[240px]">
                  <h3 className="font-body text-base font-bold text-[#0A1E3D]">{title}</h3>
                  <p className="text-slate-500 text-xs font-light leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA DUAL ── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tarjeta Pacientes */}
            <div className="bg-[#0F2850] text-white p-8 sm:p-10 rounded-[1.75rem] flex flex-col justify-between min-h-[200px] relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-semibold mb-2">¿Necesitas atención?</h3>
                <p className="text-blue-200 text-sm font-light">Encuentra al fisio ideal para ti en minutos.</p>
              </div>
              <Link to="/especialistas" className="relative z-10 bg-white text-[#0F2850] font-semibold px-6 py-3 rounded-xl text-sm mt-8 shadow-sm inline-block text-center hover:bg-slate-50 transition w-full sm:w-max">
                Buscar fisioterapeutas
              </Link>
            </div>

            {/* Tarjeta Fisioterapeutas */}
            <div className="bg-[#1A5C3A] text-white p-8 sm:p-10 rounded-[1.75rem] flex flex-col justify-between min-h-[200px] relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-semibold mb-2">¿Eres fisioterapeuta?</h3>
                <p className="text-emerald-200 text-sm font-light">Crece tu consulta con pacientes que te buscan.</p>
              </div>
              <button 
                onClick={() => navigate('/registro-fisio')} 
                className="relative z-10 bg-white text-[#1A5C3A] font-semibold px-6 py-3 rounded-xl text-sm mt-8 shadow-sm hover:bg-slate-50 transition w-full sm:w-max"
              >
                Quiero registrarme
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A1E3D] text-slate-400 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#1E3A6E] p-1.5 rounded-lg">
                <Heart className="h-3.5 w-3.5 text-white fill-white" />
              </div>
              <span className="font-display text-white font-semibold text-lg">FisioCare</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs">Conectamos pacientes con fisioterapeutas verificados en Lima.</p>
          </div>

          {[
            {
              title: 'Pacientes',
              links: ['Buscar fisioterapeuta', 'Preguntas frecuentes', 'Crear cuenta'],
            },
            {
              title: 'Profesionales',
              links: ['Únete como fisio', 'Registrarme'],
            },
          ].map(({ title, links }, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-white text-sm font-semibold">{title}</h4>
              <ul className="text-xs space-y-2.5">
                {links.map((l, lIdx) => (
                  <li key={lIdx}><a href="#" className="hover:text-white transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold">Contacto</h4>
            <ul className="text-xs space-y-2.5">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" /> hola@fisiocare.pe</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" /> +51 999 888 777</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Lima, Perú</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-3 text-center sm:text-left">
          <p>© 2026 FisioCare. Todos los derechos reservados.</p>
          <p>Hecho con ♥ en Lima</p>
        </div>
      </footer>

    </div>
  );
}
